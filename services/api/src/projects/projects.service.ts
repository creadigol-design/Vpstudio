import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import {
  assertTransition,
  InvalidStatusTransitionError,
  validateRunningOrder,
  LanguageModeSchema,
  OutputPresetSchema,
  type ProjectStatus,
  type RunningOrder,
} from "@virtual-studio/contracts";
import { z } from "zod";
import { PrismaService } from "../prisma.service";
import type { TenantContext } from "../tenancy/tenant.guard";

export const CreateProjectSchema = z.object({
  workspaceId: z.string().min(1),
  templateVersionId: z.string().min(1),
  brandKitId: z.string().optional(),
  name: z.string().min(1).max(200),
  languageMode: LanguageModeSchema,
  outputPresets: z.array(OutputPresetSchema).min(1),
});
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export const UpdateRunningOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        scriptSectionId: z.string().nullable().optional(),
        assetId: z.string().nullable().optional(),
        position: z.number().int().positive().optional(),
      }),
    )
    .min(1),
});
export type UpdateRunningOrderDto = z.infer<typeof UpdateRunningOrderSchema>;

export const UpdateScriptSchema = z.object({
  language: z.enum(["en", "cy"]),
  sections: z.array(
    z.object({
      id: z.string().min(1),
      heading: z.string(),
      body: z.string(),
      presenterNotes: z.string().optional(),
    }),
  ),
});
export type UpdateScriptDto = z.infer<typeof UpdateScriptSchema>;

interface TemplateRunningOrderItem {
  type: string;
  position: number;
  required?: boolean;
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenant: TenantContext, workspaceId?: string) {
    return this.prisma.project.findMany({
      where: { organisationId: tenant.organisationId, ...(workspaceId ? { workspaceId } : {}) },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        languageMode: true,
        outputPresets: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async get(tenant: TenantContext, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organisationId: tenant.organisationId },
      include: {
        runningOrderItems: { orderBy: { position: "asc" } },
        scripts: { include: { versions: { orderBy: { version: "desc" }, take: 1 } } },
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    });
    if (!project) {
      throw new NotFoundException({ error: "PROJECT_NOT_FOUND" });
    }
    return project;
  }

  async create(tenant: TenantContext, dto: CreateProjectDto) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: dto.workspaceId, organisationId: tenant.organisationId },
    });
    if (!workspace) {
      throw new NotFoundException({ error: "WORKSPACE_NOT_FOUND" });
    }
    const templateVersion = await this.prisma.templateVersion.findUnique({ where: { id: dto.templateVersionId } });
    if (!templateVersion) {
      throw new NotFoundException({ error: "TEMPLATE_VERSION_NOT_FOUND" });
    }

    // Projects keep the template version they were created with (spec §21.4);
    // the running order is seeded from the template definition (spec §5.1).
    const definition = templateVersion.definition as { items?: TemplateRunningOrderItem[] } | null;
    const templateItems = definition?.items ?? [];

    const project = await this.prisma.project.create({
      data: {
        organisationId: tenant.organisationId,
        workspaceId: dto.workspaceId,
        templateVersionId: dto.templateVersionId,
        brandKitId: dto.brandKitId,
        name: dto.name,
        languageMode: dto.languageMode,
        outputPresets: dto.outputPresets,
        createdById: tenant.userId,
        runningOrderItems: {
          create: templateItems.map((item) => ({
            organisationId: tenant.organisationId,
            type: item.type,
            position: item.position,
            required: item.required ?? false,
          })),
        },
      },
      include: { runningOrderItems: { orderBy: { position: "asc" } } },
    });

    await this.audit(tenant, project.id, "project.created", { templateVersionId: dto.templateVersionId });
    return project;
  }

  async transitionStatus(tenant: TenantContext, projectId: string, to: ProjectStatus) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organisationId: tenant.organisationId },
      include: { runningOrderItems: true },
    });
    if (!project) {
      throw new NotFoundException({ error: "PROJECT_NOT_FOUND" });
    }

    try {
      assertTransition(project.status as ProjectStatus, to);
    } catch (err) {
      if (err instanceof InvalidStatusTransitionError) {
        throw new ConflictException({ error: "INVALID_STATUS_TRANSITION", from: err.from, to: err.to });
      }
      throw err;
    }

    // Content validation gate: a project may only be marked ready to record
    // once its running order is structurally complete (spec §5.1 step 9).
    if (to === "READY_FOR_RECORDING") {
      const order: RunningOrder = {
        projectId: project.id,
        items: project.runningOrderItems.map((i) => ({
          id: i.id,
          type: i.type as RunningOrder["items"][number]["type"],
          position: i.position,
          required: i.required,
          scriptSectionId: i.scriptSectionId ?? undefined,
          assetId: i.assetId ?? undefined,
        })),
      };
      const issues = validateRunningOrder(order);
      if (issues.length > 0) {
        throw new BadRequestException({ error: "RUNNING_ORDER_INCOMPLETE", issues });
      }
    }

    const updated = await this.prisma.project.update({
      where: { id: project.id },
      data: { status: to },
    });
    await this.audit(tenant, project.id, "project.status_changed", { from: project.status, to });
    return updated;
  }

  /** Attach script sections or assets to running-order items, or reorder them. */
  async updateRunningOrder(tenant: TenantContext, projectId: string, dto: UpdateRunningOrderDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organisationId: tenant.organisationId },
      include: { runningOrderItems: true },
    });
    if (!project) {
      throw new NotFoundException({ error: "PROJECT_NOT_FOUND" });
    }
    const ownedIds = new Set(project.runningOrderItems.map((i) => i.id));
    for (const item of dto.items) {
      if (!ownedIds.has(item.id)) {
        throw new NotFoundException({ error: "RUNNING_ORDER_ITEM_NOT_FOUND", itemId: item.id });
      }
    }
    for (const item of dto.items) {
      await this.prisma.runningOrderItem.update({
        where: { id: item.id },
        data: {
          ...(item.scriptSectionId !== undefined ? { scriptSectionId: item.scriptSectionId } : {}),
          ...(item.assetId !== undefined ? { assetId: item.assetId } : {}),
          ...(item.position !== undefined ? { position: item.position } : {}),
        },
      });
    }
    await this.audit(tenant, projectId, "running_order.updated", { itemIds: dto.items.map((i) => i.id) });
    return this.prisma.runningOrderItem.findMany({
      where: { projectId },
      orderBy: { position: "asc" },
    });
  }

  async updateScript(tenant: TenantContext, projectId: string, dto: UpdateScriptDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organisationId: tenant.organisationId },
    });
    if (!project) {
      throw new NotFoundException({ error: "PROJECT_NOT_FOUND" });
    }

    // Language versions are linked but separate — saving Welsh never
    // overwrites English and vice versa (spec §13.2).
    const script = await this.prisma.script.upsert({
      where: { projectId_language: { projectId, language: dto.language } },
      create: { organisationId: tenant.organisationId, projectId, language: dto.language },
      update: {},
    });

    const latest = await this.prisma.scriptVersion.findFirst({
      where: { scriptId: script.id },
      orderBy: { version: "desc" },
    });
    const version = await this.prisma.scriptVersion.create({
      data: {
        scriptId: script.id,
        version: (latest?.version ?? 0) + 1,
        sections: dto.sections,
        createdBy: tenant.userId,
      },
    });

    await this.audit(tenant, projectId, "script.version_created", {
      language: dto.language,
      version: version.version,
    });
    return version;
  }

  private audit(tenant: TenantContext, projectId: string, action: string, detail: object) {
    return this.prisma.auditEvent.create({
      data: {
        organisationId: tenant.organisationId,
        projectId,
        actorId: tenant.userId,
        action,
        detail,
      },
    });
  }
}
