import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  CreateWorkspaceSchema,
  OrganisationsService,
  type CreateWorkspaceDto,
} from "./organisations.service";
import { RequirePermission } from "../tenancy/permissions.decorator";
import { Tenant } from "../tenancy/tenant.decorator";
import type { TenantContext } from "../tenancy/tenant.guard";
import { ZodValidationPipe } from "../zod-validation.pipe";

@Controller("organisations")
export class OrganisationsController {
  constructor(private readonly organisations: OrganisationsService) {}

  @Get("current")
  @RequirePermission("project:read")
  getCurrent(@Tenant() tenant: TenantContext) {
    return this.organisations.getCurrent(tenant);
  }

  @Get("current/workspaces")
  @RequirePermission("project:read")
  listWorkspaces(@Tenant() tenant: TenantContext) {
    return this.organisations.listWorkspaces(tenant);
  }

  @Post("current/workspaces")
  @RequirePermission("workspace:manage")
  createWorkspace(
    @Tenant() tenant: TenantContext,
    @Body(new ZodValidationPipe(CreateWorkspaceSchema)) body: CreateWorkspaceDto,
  ) {
    return this.organisations.createWorkspace(tenant, body);
  }
}
