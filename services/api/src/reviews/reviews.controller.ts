import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import {
  CreateApprovalRequestSchema,
  CreateCommentSchema,
  DecisionSchema,
  ReviewsService,
  type CreateApprovalRequestDto,
  type CreateCommentDto,
  type DecisionDto,
} from "./reviews.service";
import { RequirePermission } from "../tenancy/permissions.decorator";
import { Tenant } from "../tenancy/tenant.decorator";
import type { TenantContext } from "../tenancy/tenant.guard";
import { ZodValidationPipe } from "../zod-validation.pipe";

@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get("projects/:projectId/comments")
  @RequirePermission("project:read")
  listComments(@Tenant() tenant: TenantContext, @Param("projectId") projectId: string) {
    return this.reviews.listComments(tenant, projectId);
  }

  @Post("projects/:projectId/comments")
  @RequirePermission("project:read")
  addComment(
    @Tenant() tenant: TenantContext,
    @Param("projectId") projectId: string,
    @Body(new ZodValidationPipe(CreateCommentSchema)) body: CreateCommentDto,
  ) {
    return this.reviews.addComment(tenant, projectId, body);
  }

  @Post("comments/:id/resolve")
  @RequirePermission("project:review")
  @HttpCode(200)
  resolveComment(@Tenant() tenant: TenantContext, @Param("id") id: string) {
    return this.reviews.resolveComment(tenant, id);
  }

  @Post("versions/:versionId/approval-requests")
  @RequirePermission("project:create")
  createApprovalRequest(
    @Tenant() tenant: TenantContext,
    @Param("versionId") versionId: string,
    @Body(new ZodValidationPipe(CreateApprovalRequestSchema)) body: CreateApprovalRequestDto,
  ) {
    return this.reviews.createApprovalRequest(tenant, versionId, body);
  }

  @Post("approval-requests/:id/decisions")
  @RequirePermission("project:approve")
  @HttpCode(200)
  decide(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(DecisionSchema)) body: DecisionDto,
  ) {
    return this.reviews.decide(tenant, id, body);
  }

  @Get("versions/:versionId/outputs")
  @RequirePermission("project:export")
  listOutputs(@Tenant() tenant: TenantContext, @Param("versionId") versionId: string) {
    return this.reviews.listOutputs(tenant, versionId);
  }
}
