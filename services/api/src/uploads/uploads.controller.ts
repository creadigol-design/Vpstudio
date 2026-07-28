import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import {
  CompleteUploadSchema,
  CreateUploadSchema,
  RetryPartsSchema,
  UploadsService,
  type CompleteUploadDto,
  type CreateUploadDto,
  type RetryPartsDto,
} from "./uploads.service";
import { RequirePermission } from "../tenancy/permissions.decorator";
import { Tenant } from "../tenancy/tenant.decorator";
import type { TenantContext } from "../tenancy/tenant.guard";
import { ZodValidationPipe } from "../zod-validation.pipe";

@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @RequirePermission("project:record")
  create(@Tenant() tenant: TenantContext, @Body(new ZodValidationPipe(CreateUploadSchema)) body: CreateUploadDto) {
    return this.uploads.create(tenant, body);
  }

  @Post(":id/retry")
  @RequirePermission("project:record")
  @HttpCode(200)
  retry(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(RetryPartsSchema)) body: RetryPartsDto,
  ) {
    return this.uploads.retryParts(tenant, id, body);
  }

  @Post(":id/complete")
  @RequirePermission("project:record")
  @HttpCode(200)
  complete(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(CompleteUploadSchema)) body: CompleteUploadDto,
  ) {
    return this.uploads.complete(tenant, id, body);
  }

  @Post(":id/abort")
  @RequirePermission("project:record")
  @HttpCode(200)
  abort(@Tenant() tenant: TenantContext, @Param("id") id: string) {
    return this.uploads.abort(tenant, id);
  }

  @Get()
  @RequirePermission("project:read")
  list(@Tenant() tenant: TenantContext) {
    return this.uploads.list(tenant);
  }
}
