import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { PrismaService } from "../prisma.service";
import type { TenantContext } from "../tenancy/tenant.guard";

export const TemplateItemSchema = z.object({
  type: z.string().min(1),
  position: z.number().int().positive(),
  required: z.boolean().optional(),
});

export const CreateTemplateSchema = z.object({
  workspaceId: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  definition: z.object({
    items: z.array(TemplateItemSchema).min(1),
    aspectRatios: z.array(z.string()).default(["16:9", "9:16"]),
  }),
});
export type CreateTemplateDto = z.infer<typeof CreateTemplateSchema>;

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Templates visible to a tenant: their own plus platform-level (organisationId null). */
  list(tenant: TenantContext) {
    return this.prisma.programmeTemplate.findMany({
      where: { OR: [{ organisationId: tenant.organisationId }, { organisationId: null }] },
      include: {
        versions: { where: { published: true }, orderBy: { version: "desc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    });
  }

  async create(tenant: TenantContext, dto: CreateTemplateDto) {
    const template = await this.prisma.programmeTemplate.create({
      data: {
        organisationId: tenant.organisationId,
        workspaceId: dto.workspaceId,
        name: dto.name,
        description: dto.description,
        versions: {
          create: { version: 1, definition: dto.definition, published: true },
        },
      },
      include: { versions: true },
    });
    return template;
  }

  async get(tenant: TenantContext, id: string) {
    const template = await this.prisma.programmeTemplate.findFirst({
      where: { id, OR: [{ organisationId: tenant.organisationId }, { organisationId: null }] },
      include: { versions: { orderBy: { version: "desc" } } },
    });
    if (!template) {
      throw new NotFoundException({ error: "TEMPLATE_NOT_FOUND" });
    }
    return template;
  }
}
