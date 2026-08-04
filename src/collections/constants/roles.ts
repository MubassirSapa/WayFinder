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
