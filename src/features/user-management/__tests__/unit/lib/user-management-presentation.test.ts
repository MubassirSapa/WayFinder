import { describe, expect, it } from "vitest";

import {
  filterOrgUsers,
  teamMemberCountLabel,
  userInitials,
} from "@/features/user-management/lib/user-management-presentation";
import type { OrgUserListItem } from "@/features/user-management/types/user-management.types";

const users: OrgUserListItem[] = [
  {
    id: "owner-1",
    name: "Maya Chen",
    email: "maya@example.com",
    role: "owner",
    avatarUrl: null,
    buildingIds: [],
    buildingNames: [],
    isSelf: true,
  },
  {
    id: "member-1",
    name: "Jordan Lee",
    email: "jordan@example.com",
    role: "member",
    avatarUrl: null,
    buildingIds: ["building-1"],
    buildingNames: ["Northstar Medical Centre"],
    isSelf: false,
  },
];

describe("user management presentation", () => {
  it("filters team members by identity, role, and assigned building", () => {
    expect(filterOrgUsers(users, "jordan")).toEqual([users[1]]);
    expect(filterOrgUsers(users, "OWNER")).toEqual([users[0]]);
    expect(filterOrgUsers(users, "northstar")).toEqual([users[1]]);
  });

  it("returns every user for a blank search", () => {
    expect(filterOrgUsers(users, "  ")).toBe(users);
  });

  it("formats singular and plural team counts", () => {
    expect(teamMemberCountLabel(1)).toBe("1 team member");
    expect(teamMemberCountLabel(2)).toBe("2 team members");
  });

  it("builds compact initials with a safe fallback", () => {
    expect(userInitials("Jordan Lee")).toBe("JL");
    expect(userInitials("Maya")).toBe("M");
    expect(userInitials("   ")).toBe("?");
  });
});
