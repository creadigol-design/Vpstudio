import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { PrismaService } from "../prisma.service";
import type { TenantContext } from "../tenancy/tenant.guard";

export const CreateWorkspaceSchema = z.object({ name: z.string().min(1).max(200) });
export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceSchema>;

@Injectable()
export class OrganisationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrent(tenant: TenantContext) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: tenant.organisationId },
      select: { id: true, name: true, slug: true, status: true },
    });
    if (!organisation) {
      throw new NotFoundException({ error: "ORGANISATION_NOT_FOUND" });
    }
    return organisation;
  }

  listWorkspaces(tenant: TenantContext) {
    return this.prisma.workspace.findMany({
      where: { organisationId: tenant.organisationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, createdAt: true },
    });
  }

  createWorkspace(tenant: TenantContext, dto: CreateWorkspaceDto) {
    return this.prisma.workspace.create({
      data: { organisationId: tenant.organisationId, name: dto.name },
    });
  }
}
