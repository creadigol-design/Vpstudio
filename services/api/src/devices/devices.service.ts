import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { Prisma } from "@virtual-studio/database";
import { z } from "zod";
import { PrismaService } from "../prisma.service";
import type { TenantContext } from "../tenancy/tenant.guard";

export const CreateDeviceSchema = z.object({
  workspaceId: z.string().optional(),
  name: z.string().min(1).max(200),
});
export type CreateDeviceDto = z.infer<typeof CreateDeviceSchema>;

export const HeartbeatSchema = z.object({
  registrationKey: z.string().min(1),
  agentVersion: z.string().optional(),
  osVersion: z.string().optional(),
  freeStorageBytes: z.number().int().nonnegative().optional(),
  uploadQueueDepth: z.number().int().nonnegative().optional(),
  components: z
    .array(
      z.object({
        kind: z.enum(["CAMERA", "PRIMARY_MIC", "BACKUP_MIC", "TELEPROMPTER", "LIGHTS", "STORAGE", "NETWORK"]),
        identifier: z.string().optional(),
        state: z.enum(["CONNECTED", "DISCONNECTED", "DEGRADED", "UNKNOWN"]),
        detail: z.record(z.unknown()).optional(),
      }),
    )
    .optional(),
  warnings: z.array(z.string()).optional(),
});
export type HeartbeatDto = z.infer<typeof HeartbeatSchema>;

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenant: TenantContext) {
    return this.prisma.studioDevice.findMany({
      where: { organisationId: tenant.organisationId },
      include: { components: true },
      orderBy: { name: "asc" },
    });
  }

  /** Registers a studio device; the returned key is shown once and used by the capture agent. */
  async create(tenant: TenantContext, dto: CreateDeviceDto) {
    const registrationKey = `vsd_${randomBytes(24).toString("hex")}`;
    const device = await this.prisma.studioDevice.create({
      data: {
        organisationId: tenant.organisationId,
        workspaceId: dto.workspaceId,
        name: dto.name,
        registrationKey,
      },
    });
    return { ...device, registrationKey };
  }

  /** Capture-agent check-in (spec §10). Authenticated by registration key, not a user token. */
  async heartbeat(dto: HeartbeatDto) {
    const device = await this.prisma.studioDevice.findUnique({ where: { registrationKey: dto.registrationKey } });
    if (!device) {
      throw new UnauthorizedException({ error: "UNKNOWN_DEVICE" });
    }
    const updated = await this.prisma.studioDevice.update({
      where: { id: device.id },
      data: {
        status: "ONLINE",
        lastCheckInAt: new Date(),
        agentVersion: dto.agentVersion ?? device.agentVersion,
        osVersion: dto.osVersion ?? device.osVersion,
        freeStorageBytes: dto.freeStorageBytes !== undefined ? BigInt(dto.freeStorageBytes) : device.freeStorageBytes,
        uploadQueueDepth: dto.uploadQueueDepth ?? device.uploadQueueDepth,
        warnings: dto.warnings ?? undefined,
      },
    });
    for (const component of dto.components ?? []) {
      await this.prisma.deviceComponent.upsert({
        where: {
          studioDeviceId_kind_identifier: {
            studioDeviceId: device.id,
            kind: component.kind,
            identifier: component.identifier ?? "",
          },
        },
        create: {
          studioDeviceId: device.id,
          kind: component.kind,
          identifier: component.identifier ?? "",
          state: component.state,
          detail: component.detail as Prisma.InputJsonValue | undefined,
        },
        update: { state: component.state, detail: component.detail as Prisma.InputJsonValue | undefined },
      });
    }
    return { id: updated.id, status: updated.status, lastCheckInAt: updated.lastCheckInAt };
  }

  async get(tenant: TenantContext, id: string) {
    const device = await this.prisma.studioDevice.findFirst({
      where: { id, organisationId: tenant.organisationId },
      include: { components: true },
    });
    if (!device) {
      throw new NotFoundException({ error: "DEVICE_NOT_FOUND" });
    }
    return device;
  }
}
