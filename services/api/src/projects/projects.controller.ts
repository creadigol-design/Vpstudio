import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { z } from "zod";
import { ProjectStatusSchema } from "@virtual-studio/contracts";
import {
  CreateProjectSchema,
  ProjectsService,
  UpdateRunningOrderSchema,
  UpdateScriptSchema,
  type CreateProjectDto,
  type UpdateRunningOrderDto,
  type UpdateScriptDto,
} from "./projects.service";
import { RequirePermission } from "../tenancy/permissions.decorator";
import { Tenant } from "../tenancy/tenant.decorator";
import type { TenantContext } from "../tenancy/tenant.guard";
import { ZodValidationPipe } from "../zod-validation.pipe";

const TransitionSchema = z.object({ to: ProjectStatusSchema });
type TransitionDto = z.infer<typeof TransitionSchema>;

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @RequirePermission("project:read")
  list(@Tenant() tenant: TenantContext, @Query("workspaceId") workspaceId?: string) {
    return this.projects.list(tenant, workspaceId);
  }

  @Get(":id")
  @RequirePermission("project:read")
  get(@Tenant() tenant: TenantContext, @Param("id") id: string) {
    return this.projects.get(tenant, id);
  }

  @Post()
  @RequirePermission("project:create")
  create(@Tenant() tenant: TenantContext, @Body(new ZodValidationPipe(CreateProjectSchema)) body: CreateProjectDto) {
    return this.projects.create(tenant, body);
  }

  @Post(":id/status")
  @RequirePermission("project:create")
  transition(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(TransitionSchema)) body: TransitionDto,
  ) {
    return this.projects.transitionStatus(tenant, id, body.to);
  }

  @Put(":id/running-order")
  @RequirePermission("project:create")
  updateRunningOrder(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateRunningOrderSchema)) body: UpdateRunningOrderDto,
  ) {
    return this.projects.updateRunningOrder(tenant, id, body);
  }

  @Put(":id/script")
  @RequirePermission("project:create")
  updateScript(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateScriptSchema)) body: UpdateScriptDto,
  ) {
    return this.projects.updateScript(tenant, id, body);
  }
}
