import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";

import { PROFILE_CLIENT } from "../constants/profile.constants";
import type { OrganizationType } from "../types/profile.types";

export function organizationInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
}

export function organizationTypeLabel(type: OrganizationType) {
  return ORGANIZATION_TYPES.find((option) => option.value === type)?.label ?? "Organization";
}

export function visitorAddressSummary(city: string, country: string) {
  const summary = [city.trim(), country.trim()].filter(Boolean).join(", ");
  return summary || PROFILE_CLIENT.ADDRESS_MISSING;
}
