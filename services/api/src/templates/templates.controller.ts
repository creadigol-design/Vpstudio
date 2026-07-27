import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateTemplateSchema, TemplatesService, type CreateTemplateDto } from "./templates.service";
import { RequirePermission } from "../tenancy/permissions.decorator";
import { Tenant } from "../tenancy/tenant.decorator";
import type { TenantContext } from "../tenancy/tenant.guard";
import { ZodValidationPipe } from "../zod-validation.pipe";

@Controller("templates")
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Get()
  @RequirePermission("project:read")
  list(@Tenant() tenant: TenantContext) {
    return this.templates.list(tenant);
  }

  @Get(":id")
  @RequirePermission("project:read")
  get(@Tenant() tenant: TenantContext, @Param("id") id: string) {
    return this.templates.get(tenant, id);
  }

  @Post()
  @RequirePermission("template:manage")
  create(@Tenant() tenant: TenantContext, @Body(new ZodValidationPipe(CreateTemplateSchema)) body: CreateTemplateDto) {
    return this.templates.create(tenant, body);
  }
}
