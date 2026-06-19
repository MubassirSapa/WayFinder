export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: "Admin" },
  { value: ROLES.USER, label: "User" },
] as const;
