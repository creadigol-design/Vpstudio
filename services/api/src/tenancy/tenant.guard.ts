import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { Role } from "@virtual-studio/contracts";
import { PrismaService } from "../prisma.service";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard";

export interface TenantContext {
  organisationId: string;
  role: Role;
  userId: string;
}

export interface TenantRequest extends AuthenticatedRequest {
  tenant?: TenantContext;
}

/**
 * Resolves the caller's membership for the organisation named in the
 * x-organisation-id header. Tenant access is enforced here in the backend,
 * never by front-end filtering alone (spec §27.3).
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<TenantRequest>();
    if (!req.user) {
      throw new ForbiddenException({ error: "NOT_AUTHENTICATED" });
    }
    const organisationId = req.headers["x-organisation-id"];
    if (typeof organisationId !== "string" || organisationId.length === 0) {
      throw new ForbiddenException({ error: "MISSING_ORGANISATION" });
    }
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organisationId: { userId: req.user.sub, organisationId } },
    });
    if (!membership) {
      throw new ForbiddenException({ error: "NOT_A_MEMBER" });
    }
    req.tenant = {
      organisationId,
      role: membership.role as Role,
      userId: req.user.sub,
    };
    return true;
  }
}
