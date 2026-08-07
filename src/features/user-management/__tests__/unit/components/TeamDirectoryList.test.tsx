import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TeamDirectoryList } from "@/features/user-management/components/TeamDirectoryList";
import type { OrgUserListItem } from "@/features/user-management/types/user-management.types";

vi.mock("@/features/invitations/components/PendingInvitesSection", () => ({
  PendingInvitesSection: () => null,
}));

vi.mock("@/features/user-management/components/TeamMemberCard", () => ({
  TeamMemberCard: ({ user }: { user: OrgUserListItem }) => (
    <article aria-label={user.name}>{user.email}</article>
  ),
}));

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

afterEach(cleanup);

describe("TeamDirectoryList", () => {
  it("renders team members and updates the visible count when searching", () => {
    render(<TeamDirectoryList users={users} pendingInvitations={[]} />);

    expect(screen.getByText("2 team members")).toBeTruthy();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search team members" }), {
      target: { value: "Northstar" },
    });

    expect(screen.getByText("1 team member")).toBeTruthy();
    expect(screen.getByRole("article", { name: "Jordan Lee" })).toBeTruthy();
    expect(screen.queryByRole("article", { name: "Maya Chen" })).toBeNull();
  });

  it("shows a clear empty-result message when no member matches", () => {
    render(<TeamDirectoryList users={users} pendingInvitations={[]} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search team members" }), {
      target: { value: "not a team member" },
    });

    expect(screen.getByText("No team members match your search.")).toBeTruthy();
  });
});
