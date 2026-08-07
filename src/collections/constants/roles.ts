export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  MEMBER: "member",
} as const;

export const ROLE_OPTIONS = [
  { value: ROLES.OWNER, label: "Owner" },
  { value: ROLES.MANAGER, label: "Manager" },
  { value: ROLES.MEMBER, label: "Member" },
] as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Owner/manager share the same organization-wide management ceiling everywhere in this app. */
export function isOwnerOrManager(role: Role | null | undefined): boolean {
  return role === ROLES.OWNER || role === ROLES.MANAGER;
}
