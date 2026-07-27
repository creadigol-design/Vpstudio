import { SetMetadata, applyDecorators, UseGuards } from "@nestjs/common";
import type { Permission } from "@virtual-studio/contracts";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "./tenant.guard";
import { PermissionsGuard } from "./permissions.guard";

export const PERMISSION_KEY = "required_permission";

/** Auth + tenant + permission in one decorator for controller handlers. */
export function RequirePermission(permission: Permission) {
  return applyDecorators(SetMetadata(PERMISSION_KEY, permission), UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard));
}
