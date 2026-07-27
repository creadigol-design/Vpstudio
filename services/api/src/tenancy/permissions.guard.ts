import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { roleHasPermission, type Permission } from "@virtual-studio/contracts";
import { PERMISSION_KEY } from "./permissions.decorator";
import type { TenantRequest } from "./tenant.guard";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<Permission | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permission) {
      return true;
    }
    const req = context.switchToHttp().getRequest<TenantRequest>();
    if (!req.tenant || !roleHasPermission(req.tenant.role, permission)) {
      throw new ForbiddenException({ error: "PERMISSION_DENIED", permission });
    }
    return true;
  }
}
