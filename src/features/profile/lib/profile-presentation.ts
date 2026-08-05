import { PROFILE_ROLE_LABELS } from "../constants/profile.constants";
import type { ProfileEditData } from "../types/profile.types";

export function profileInitial(name: string, email: string): string {
  return (name.trim()[0] ?? email.trim()[0] ?? "A").toUpperCase();
}

export function profileRoleLabel(role: ProfileEditData["role"]): string {
  return PROFILE_ROLE_LABELS[role];
}
