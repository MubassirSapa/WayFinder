"use client";

import { useMemo, useState } from "react";
import { SearchIcon, UsersIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { PendingInvitesSection } from "@/features/invitations/components/PendingInvitesSection";
import type { PendingInvitationListItem } from "@/features/invitations/types/invitation.types";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import {
  filterOrgUsers,
  teamMemberCountLabel,
} from "../lib/user-management-presentation";
import type { OrgUserListItem } from "../types/user-management.types";
import { TeamRoleSection } from "./TeamRoleSection";

type TeamDirectoryListProps = {
  users: OrgUserListItem[];
  pendingInvitations: PendingInvitationListItem[];
};

export function TeamDirectoryList({ users, pendingInvitations }: TeamDirectoryListProps) {
  const [query, setQuery] = useState("");
  const filteredUsers = useMemo(() => filterOrgUsers(users, query), [query, users]);

  const owners = filteredUsers.filter((user) => user.role === "owner");
  const managers = filteredUsers.filter((user) => user.role === "manager");
  const members = filteredUsers.filter((user) => user.role === "member");

  if (users.length === 0 && pendingInvitations.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center border-y border-dashed border-border px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <UsersIcon className="size-5" />
        </span>
        <h2 className="mt-4 font-heading text-lg font-semibold">
          {USER_MANAGEMENT_CLIENT.EMPTY_TITLE}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {USER_MANAGEMENT_CLIENT.EMPTY_DESC}
        </p>
      </div>
    );
  }

  return (
    <section aria-label={USER_MANAGEMENT_CLIENT.LIST_TITLE} className="space-y-6">
      <div className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <SearchIcon className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={USER_MANAGEMENT_CLIENT.SEARCH_PLACEHOLDER}
            aria-label={USER_MANAGEMENT_CLIENT.SEARCH_LABEL}
            className="h-11 ps-10"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <UsersIcon className="size-4" aria-hidden="true" />
          <p aria-live="polite">{teamMemberCountLabel(filteredUsers.length)}</p>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {USER_MANAGEMENT_CLIENT.NO_SEARCH_RESULTS}
        </p>
      ) : (
        <div className="space-y-8">
          <TeamRoleSection title={USER_MANAGEMENT_CLIENT.SECTION_OWNER} users={owners} />
          <TeamRoleSection title={USER_MANAGEMENT_CLIENT.SECTION_MANAGERS} users={managers} />
          <TeamRoleSection title={USER_MANAGEMENT_CLIENT.SECTION_MEMBERS} users={members} />
        </div>
      )}

      <PendingInvitesSection invitations={pendingInvitations} />
    </section>
  );
}
