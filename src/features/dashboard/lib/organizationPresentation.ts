import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";

export function organizationTypeLabel(type?: string | null): string {
  return ORGANIZATION_TYPES.find((option) => option.value === type)?.label ?? "Organization";
}

export function organizationInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
