"use client";

import { useMemo, useState } from "react";
import { SearchIcon, UsersIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import {
  filterOrgUsers,
  teamMemberCountLabel,
} from "../lib/user-management-presentation";
import type {
  OrgBuildingOption,
  OrgUserListItem,
} from "../types/user-management.types";
import { TeamMemberCard } from "./TeamMemberCard";

type TeamDirectoryListProps = {
  users: OrgUserListItem[];
  buildingOptions: OrgBuildingOption[];
};

export function TeamDirectoryList({ users, buildingOptions }: TeamDirectoryListProps) {
  const [query, setQuery] = useState("");
  const filteredUsers = useMemo(() => filterOrgUsers(users, query), [query, users]);

  if (users.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center border-y border-border px-6 py-12 text-center">
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
    <section aria-label={USER_MANAGEMENT_CLIENT.LIST_TITLE} className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={USER_MANAGEMENT_CLIENT.SEARCH_PLACEHOLDER}
            aria-label={USER_MANAGEMENT_CLIENT.SEARCH_LABEL}
            className="h-11 ps-10"
          />
        </div>
        <p className="shrink-0 text-sm text-muted-foreground" aria-live="polite">
          {teamMemberCountLabel(filteredUsers.length)}
        </p>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {USER_MANAGEMENT_CLIENT.NO_SEARCH_RESULTS}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredUsers.map((user) => (
            <TeamMemberCard
              key={user.id}
              user={user}
              buildingOptions={buildingOptions}
            />
          ))}
        </div>
      )}
    </section>
  );
}
