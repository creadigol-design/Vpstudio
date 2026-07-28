import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { assertTransition, InvalidStatusTransitionError, type ProjectStatus } from "@virtual-studio/contracts";
import { ObjectStorage } from "@virtual-studio/storage";
import { z } from "zod";
import { PrismaService } from "../prisma.service";
import type { TenantContext } from "../tenancy/tenant.guard";

export const CreateCommentSchema = z.object({
  projectVersionId: z.string().optional(),
  body: z.string().min(1).max(5000),
  timecodeMs: z.number().int().nonnegative().optional(),
  assigneeId: z.string().optional(),
});
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;

export const APPROVAL_RULES = ["ONE_NAMED", "ANY_OF_GROUP", "ALL_REQUIRED"] as const;

export const CreateApprovalRequestSchema = z.object({
  rule: z.enum(APPROVAL_RULES),
  requiredUserIds: z.array(z.string().min(1)).min(1),
});
export type CreateApprovalRequestDto = z.infer<typeof CreateApprovalRequestSchema>;

export const DecisionSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT", "REQUEST_CHANGES"]),
  note: z.string().max(5000).optional(),
});
export type DecisionDto = z.infer<typeof DecisionSchema>;

@Injectable()
export class ReviewsService {
  // Instantiated here rather than injected so Nest does not try to resolve it.
  private storage: ObjectStorage = new ObjectStorage();

  constructor(private readonly prisma: PrismaService) {}

  /** @internal test hook */
  useStorage(storage: ObjectStorage): void {
    this.storage = storage;
  }

  // ---------------------------------------------------------------- comments

  async addComment(tenant: TenantContext, projectId: string, dto: CreateCommentDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organisationId: tenant.organisationId },
      select: { id: true },
    });
    if (!project) throw new NotFoundException({ error: "PROJECT_NOT_FOUND" });
    if (dto.projectVersionId) {
      const version = await this.prisma.projectVersion.findFirst({
        where: { id: dto.projectVersionId, projectId, organisationId: tenant.organisationId },
        select: { id: true },
      });
      if (!version) throw new NotFoundException({ error: "PROJECT_VERSION_NOT_FOUND" });
    }
    return this.prisma.comment.create({
      data: {
        organisationId: tenant.organisationId,
        projectId,
        projectVersionId: dto.projectVersionId,
        authorId: tenant.userId,
        body: dto.body,
        timecodeMs: dto.timecodeMs,
        assigneeId: dto.assigneeId,
      },
    });
  }

  async resolveComment(tenant: TenantContext, commentId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, organisationId: tenant.organisationId },
    });
    if (!comment) throw new NotFoundException({ error: "COMMENT_NOT_FOUND" });
    return this.prisma.comment.update({ where: { id: comment.id }, data: { resolved: true } });
  }

  listComments(tenant: TenantContext, projectId: string) {
    return this.prisma.comment.findMany({
      where: { projectId, organisationId: tenant.organisationId },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, displayName: true } } },
    });
  }

  // ------------------------------------------------------- approval requests

  /**
   * Requests approval for a version (spec §24.3) and moves the project to
   * AWAITING_APPROVAL. Required users must be members holding approval
   * rights so a request can never be satisfied by someone without them.
   */
  async createApprovalRequest(tenant: TenantContext, versionId: string, dto: CreateApprovalRequestDto) {
    const version = await this.prisma.projectVersion.findFirst({
      where: { id: versionId, organisationId: tenant.organisationId },
      include: { project: true },
    });
    if (!version) throw new NotFoundException({ error: "PROJECT_VERSION_NOT_FOUND" });

    const memberships = await this.prisma.membership.findMany({
      where: { organisationId: tenant.organisationId, userId: { in: dto.requiredUserIds } },
    });
    const memberIds = new Set(memberships.map((m) => m.userId));
    const missing = dto.requiredUserIds.filter((id) => !memberIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException({ error: "APPROVERS_NOT_MEMBERS", userIds: missing });
    }

    this.transitionProject(version.project.status as ProjectStatus, "AWAITING_APPROVAL");
    const request = await this.prisma.approvalRequest.create({
      data: {
        organisationId: tenant.organisationId,
        projectVersionId: versionId,
        rule: dto.rule,
        requiredUserIds: dto.requiredUserIds,
        status: "PENDING",
      },
    });
    await this.prisma.project.update({
      where: { id: version.projectId },
      data: { status: "AWAITING_APPROVAL" },
    });
    await this.audit(tenant, version.projectId, "approval.requested", {
      approvalRequestId: request.id,
      rule: dto.rule,
      requiredUserIds: dto.requiredUserIds,
    });
    return request;
  }

  /**
   * Records a decision and evaluates the request rule (spec §24.3):
   * - REJECT     → request REJECTED, project back to DRAFT_READY
   * - REQUEST_CHANGES → request REJECTED, project to CHANGES_REQUESTED
   * - APPROVE    → ONE_NAMED / ANY_OF_GROUP: approved immediately;
   *                ALL_REQUIRED: approved once every required user approves.
   */
  async decide(tenant: TenantContext, requestId: string, dto: DecisionDto) {
    const request = await this.prisma.approvalRequest.findFirst({
      where: { id: requestId, organisationId: tenant.organisationId },
      include: { decisions: true, projectVersion: { include: { project: true } } },
    });
    if (!request) throw new NotFoundException({ error: "APPROVAL_REQUEST_NOT_FOUND" });
    if (request.status !== "PENDING") {
      throw new ConflictException({ error: "APPROVAL_REQUEST_CLOSED", status: request.status });
    }
    if (!request.requiredUserIds.includes(tenant.userId)) {
      throw new ForbiddenException({ error: "NOT_A_REQUIRED_APPROVER" });
    }
    if (request.decisions.some((d) => d.userId === tenant.userId)) {
      throw new ConflictException({ error: "ALREADY_DECIDED" });
    }

    const decision = await this.prisma.approvalDecision.create({
      data: {
        approvalRequestId: request.id,
        userId: tenant.userId,
        decision: dto.decision,
        note: dto.note,
      },
    });

    const project = request.projectVersion.project;
    let requestStatus = request.status;
    let projectStatus: ProjectStatus | null = null;

    if (dto.decision === "REJECT") {
      requestStatus = "REJECTED";
      projectStatus = "DRAFT_READY";
    } else if (dto.decision === "REQUEST_CHANGES") {
      requestStatus = "REJECTED";
      projectStatus = "CHANGES_REQUESTED";
    } else {
      const approvals = new Set(
        [...request.decisions.filter((d) => d.decision === "APPROVE").map((d) => d.userId), tenant.userId],
      );
      const satisfied =
        request.rule === "ALL_REQUIRED" ? request.requiredUserIds.every((id) => approvals.has(id)) : true;
      if (satisfied) {
        requestStatus = "APPROVED";
        projectStatus = "APPROVED";
      }
    }

    if (projectStatus) {
      this.transitionProject(project.status as ProjectStatus, projectStatus);
      await this.prisma.approvalRequest.update({ where: { id: request.id }, data: { status: requestStatus } });
      await this.prisma.project.update({ where: { id: project.id }, data: { status: projectStatus } });
    }
    await this.audit(tenant, project.id, "approval.decision", {
      approvalRequestId: request.id,
      decision: dto.decision,
      requestStatus,
      projectStatus,
    });
    return { decisionId: decision.id, requestStatus, projectStatus: projectStatus ?? project.status };
  }

  // ----------------------------------------------------------------- outputs

  /**
   * Time-limited download links for a version's rendered outputs (spec §5.5).
   * Export is unlocked only once the project is approved (spec §5.4 step 7).
   */
  async listOutputs(tenant: TenantContext, versionId: string) {
    const version = await this.prisma.projectVersion.findFirst({
      where: { id: versionId, organisationId: tenant.organisationId },
      include: { project: { select: { status: true } } },
    });
    if (!version) throw new NotFoundException({ error: "PROJECT_VERSION_NOT_FOUND" });
    const status = version.project.status as ProjectStatus;
    if (status !== "APPROVED" && status !== "EXPORTING" && status !== "COMPLETED") {
      throw new ForbiddenException({ error: "PROJECT_NOT_APPROVED", status });
    }
    const outputs = await this.prisma.mediaAsset.findMany({
      where: {
        organisationId: tenant.organisationId,
        kind: "RENDER_OUTPUT",
        technicalMetadata: { path: ["projectVersionId"], equals: versionId },
      },
    });
    return Promise.all(
      outputs.map(async (o) => ({
        mediaAssetId: o.id,
        fileName: o.fileName,
        durationSeconds: o.durationSeconds,
        downloadUrl: await this.storage.presignGet(o.storageKey, 3600),
        expiresInSeconds: 3600,
      })),
    );
  }

  // ----------------------------------------------------------------- helpers

  private transitionProject(from: ProjectStatus, to: ProjectStatus): void {
    try {
      assertTransition(from, to);
    } catch (err) {
      if (err instanceof InvalidStatusTransitionError) {
        throw new ConflictException({ error: "INVALID_STATUS_TRANSITION", from: err.from, to: err.to });
      }
      throw err;
    }
  }

  private audit(tenant: TenantContext, projectId: string, action: string, detail: object) {
    return this.prisma.auditEvent.create({
      data: { organisationId: tenant.organisationId, projectId, actorId: tenant.userId, action, detail },
    });
  }
}
