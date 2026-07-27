import { z } from "zod";

/** Platform roles (spec §4, §28.2). */
export const ROLES = [
  "PLATFORM_ADMIN",
  "PRODUCTION_ADMIN",
  "ORG_ADMIN",
  "CREATOR",
  "PRESENTER",
  "REVIEWER",
  "GUEST",
] as const;

export const RoleSchema = z.enum(ROLES);
export type Role = z.infer<typeof RoleSchema>;

/** Coarse capability grants; resource-level checks still apply. */
export const PERMISSIONS = [
  "org:manage",
  "workspace:manage",
  "brand:manage",
  "template:manage",
  "project:create",
  "project:read",
  "project:record",
  "project:review",
  "project:approve",
  "project:export",
  "device:manage",
  "platform:admin",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  PLATFORM_ADMIN: [...PERMISSIONS],
  PRODUCTION_ADMIN: [
    "workspace:manage",
    "brand:manage",
    "template:manage",
    "project:create",
    "project:read",
    "project:review",
    "project:approve",
    "project:export",
    "device:manage",
  ],
  ORG_ADMIN: [
    "org:manage",
    "workspace:manage",
    "brand:manage",
    "project:create",
    "project:read",
    "project:review",
    "project:approve",
    "project:export",
  ],
  CREATOR: ["project:create", "project:read", "project:record", "project:export"],
  PRESENTER: ["project:record"],
  REVIEWER: ["project:read", "project:review", "project:approve"],
  GUEST: [],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
