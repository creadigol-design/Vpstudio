import { describe, expect, it } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import { PermissionsGuard } from "../src/tenancy/permissions.guard";
import type { Permission } from "@virtual-studio/contracts";

function contextFor(role: string | undefined, permission: Permission | undefined) {
  const req = role ? { tenant: { organisationId: "org_1", userId: "u1", role } } : {};
  return {
    reflector: {
      getAllAndOverride: () => permission,
    },
    ctx: {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => req }),
    },
  };
}

describe("PermissionsGuard", () => {
  it("passes when no permission metadata is present", () => {
    const { reflector, ctx } = contextFor("CREATOR", undefined);
    const guard = new PermissionsGuard(reflector as never);
    expect(guard.canActivate(ctx as never)).toBe(true);
  });

  it("allows a role holding the permission", () => {
    const { reflector, ctx } = contextFor("CREATOR", "project:create");
    const guard = new PermissionsGuard(reflector as never);
    expect(guard.canActivate(ctx as never)).toBe(true);
  });

  it("rejects a role without the permission", () => {
    const { reflector, ctx } = contextFor("PRESENTER", "project:approve");
    const guard = new PermissionsGuard(reflector as never);
    expect(() => guard.canActivate(ctx as never)).toThrow(ForbiddenException);
  });

  it("rejects when tenant context is missing", () => {
    const { reflector, ctx } = contextFor(undefined, "project:read");
    const guard = new PermissionsGuard(reflector as never);
    expect(() => guard.canActivate(ctx as never)).toThrow(ForbiddenException);
  });
});
