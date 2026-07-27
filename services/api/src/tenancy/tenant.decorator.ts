import { createParamDecorator, ExecutionContext, ForbiddenException } from "@nestjs/common";
import type { TenantContext, TenantRequest } from "./tenant.guard";

/** Injects the resolved tenant context; guards must have run first. */
export const Tenant = createParamDecorator((_data: unknown, ctx: ExecutionContext): TenantContext => {
  const req = ctx.switchToHttp().getRequest<TenantRequest>();
  if (!req.tenant) {
    throw new ForbiddenException({ error: "TENANT_NOT_RESOLVED" });
  }
  return req.tenant;
});
