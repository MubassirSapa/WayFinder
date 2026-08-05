import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import type { OrgUserListItem } from "../types/user-management.types";

export function filterOrgUsers(users: OrgUserListItem[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return users;

  return users.filter((user) => {
    const searchableValues = [
      user.name,
      user.email,
      user.role,
      ...user.buildingNames,
    ];

    return searchableValues.some((value) =>
      value.toLocaleLowerCase().includes(normalizedQuery),
    );
  });
}

export function teamMemberCountLabel(count: number) {
  const noun =
    count === 1
      ? USER_MANAGEMENT_CLIENT.MEMBER_SINGULAR
      : USER_MANAGEMENT_CLIENT.MEMBER_PLURAL;

  return `${count} ${noun}`;
}

export function userInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "?";
}
