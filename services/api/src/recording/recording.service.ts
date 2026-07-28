import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { PrismaService } from "../prisma.service";
import type { TenantContext } from "../tenancy/tenant.guard";

export const CreateRecordingSessionSchema = z.object({
  projectId: z.string().min(1),
  studioDeviceId: z.string().optional(),
});
export type CreateRecordingSessionDto = z.infer<typeof CreateRecordingSessionSchema>;

export const RegisterTakeSchema = z.object({
  sectionId: z.string().min(1),
  startedAt: z.string().datetime(),
  stoppedAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
  note: z.string().max(2000).optional(),
});
export type RegisterTakeDto = z.infer<typeof RegisterTakeSchema>;

@Injectable()
export class RecordingService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(tenant: TenantContext, dto: CreateRecordingSessionDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, organisationId: tenant.organisationId },
      select: { id: true },
    });
    if (!project) throw new NotFoundException({ error: "PROJECT_NOT_FOUND" });
    return this.prisma.recordingSession.create({
      data: {
        organisationId: tenant.organisationId,
        projectId: dto.projectId,
        studioDeviceId: dto.studioDeviceId,
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });
  }

  /** Registers a take; take numbers increment per section (spec §15.3). */
  async registerTake(tenant: TenantContext, sessionId: string, dto: RegisterTakeDto) {
    const session = await this.getOwnedSession(tenant, sessionId);
    if (session.status !== "ACTIVE") {
      throw new ConflictException({ error: "SESSION_NOT_ACTIVE", status: session.status });
    }
    const latest = await this.prisma.take.findFirst({
      where: { recordingSessionId: session.id, sectionId: dto.sectionId },
      orderBy: { takeNumber: "desc" },
    });
    return this.prisma.take.create({
      data: {
        organisationId: tenant.organisationId,
        recordingSessionId: session.id,
        sectionId: dto.sectionId,
        takeNumber: (latest?.takeNumber ?? 0) + 1,
        startedAt: new Date(dto.startedAt),
        stoppedAt: dto.stoppedAt ? new Date(dto.stoppedAt) : undefined,
        metadata: dto.metadata as never,
        note: dto.note,
      },
    });
  }

  /**
   * Accepts a take as the preferred one for its section. Other takes are
   * marked REJECTED but never deleted (spec §15.3) — source media is retained
   * until the retention window expires.
   */
  async acceptTake(tenant: TenantContext, takeId: string) {
    const take = await this.prisma.take.findFirst({
      where: { id: takeId, organisationId: tenant.organisationId },
    });
    if (!take) throw new NotFoundException({ error: "TAKE_NOT_FOUND" });

    await this.prisma.take.updateMany({
      where: { recordingSessionId: take.recordingSessionId, sectionId: take.sectionId, NOT: { id: take.id } },
      data: { status: "REJECTED", preferred: false },
    });
    return this.prisma.take.update({
      where: { id: take.id },
      data: { status: "ACCEPTED", preferred: true },
    });
  }

  async submitSession(tenant: TenantContext, sessionId: string) {
    const session = await this.getOwnedSession(tenant, sessionId);
    if (session.status !== "ACTIVE") {
      throw new ConflictException({ error: "SESSION_NOT_ACTIVE", status: session.status });
    }
    return this.prisma.recordingSession.update({
      where: { id: session.id },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });
  }

  getSession(tenant: TenantContext, sessionId: string) {
    return this.getOwnedSession(tenant, sessionId, true);
  }

  private async getOwnedSession(tenant: TenantContext, sessionId: string, includeTakes = false) {
    const session = await this.prisma.recordingSession.findFirst({
      where: { id: sessionId, organisationId: tenant.organisationId },
      include: includeTakes ? { takes: { include: { mediaAssets: true }, orderBy: { createdAt: "asc" } } } : undefined,
    });
    if (!session) throw new NotFoundException({ error: "RECORDING_SESSION_NOT_FOUND" });
    return session;
  }
}
