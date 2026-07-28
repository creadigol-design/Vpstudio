import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import {
  CreateRecordingSessionSchema,
  RecordingService,
  RegisterTakeSchema,
  type CreateRecordingSessionDto,
  type RegisterTakeDto,
} from "./recording.service";
import { RequirePermission } from "../tenancy/permissions.decorator";
import { Tenant } from "../tenancy/tenant.decorator";
import type { TenantContext } from "../tenancy/tenant.guard";
import { ZodValidationPipe } from "../zod-validation.pipe";

@Controller("recording-sessions")
export class RecordingController {
  constructor(private readonly recording: RecordingService) {}

  @Post()
  @RequirePermission("project:record")
  createSession(
    @Tenant() tenant: TenantContext,
    @Body(new ZodValidationPipe(CreateRecordingSessionSchema)) body: CreateRecordingSessionDto,
  ) {
    return this.recording.createSession(tenant, body);
  }

  @Get(":id")
  @RequirePermission("project:record")
  getSession(@Tenant() tenant: TenantContext, @Param("id") id: string) {
    return this.recording.getSession(tenant, id);
  }

  @Post(":id/takes")
  @RequirePermission("project:record")
  registerTake(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(RegisterTakeSchema)) body: RegisterTakeDto,
  ) {
    return this.recording.registerTake(tenant, id, body);
  }

  @Post("takes/:takeId/accept")
  @RequirePermission("project:record")
  @HttpCode(200)
  acceptTake(@Tenant() tenant: TenantContext, @Param("takeId") takeId: string) {
    return this.recording.acceptTake(tenant, takeId);
  }

  @Post(":id/submit")
  @RequirePermission("project:record")
  @HttpCode(200)
  submitSession(@Tenant() tenant: TenantContext, @Param("id") id: string) {
    return this.recording.submitSession(tenant, id);
  }
}
