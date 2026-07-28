import { Controller, Get, Param, Post } from "@nestjs/common";
import { RendersService } from "./renders.service";
import { RequirePermission } from "../tenancy/permissions.decorator";
import { Tenant } from "../tenancy/tenant.decorator";
import type { TenantContext } from "../tenancy/tenant.guard";

@Controller()
export class RendersController {
  constructor(private readonly renders: RendersService) {}

  @Post("projects/:projectId/versions")
  @RequirePermission("project:create")
  createVersion(@Tenant() tenant: TenantContext, @Param("projectId") projectId: string) {
    return this.renders.createVersion(tenant, projectId);
  }

  @Get("versions/:id")
  @RequirePermission("project:read")
  getVersion(@Tenant() tenant: TenantContext, @Param("id") id: string) {
    return this.renders.getVersion(tenant, id);
  }

  @Get("renders")
  @RequirePermission("project:read")
  listRenderJobs(@Tenant() tenant: TenantContext) {
    return this.renders.listRenderJobs(tenant);
  }
}
