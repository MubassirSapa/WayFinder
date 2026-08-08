import type { ReactNode } from "react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/collections/constants/roles";
import { EntitySummaryCard } from "@/features/dashboard/components/EntitySummaryCard";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import { userInitials } from "../lib/user-management-presentation";
import type { OrgUserDetail } from "../types/user-management.types";

type UserSummaryCardProps = {
  user: OrgUserDetail;
  action?: ReactNode;
};

export function UserSummaryCard({ user, action }: UserSummaryCardProps) {
  return (
    <EntitySummaryCard
      visual={
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/15 sm:size-28">
          {user.avatarUrl ? (
            <Image alt={user.name} src={user.avatarUrl} fill sizes="112px" className="object-cover" unoptimized />
          ) : (
            <span className="text-2xl font-medium text-primary">{userInitials(user.name)}</span>
          )}
        </div>
      }
      title={user.name}
      meta={
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
          {user.isSelf ? (
            <Badge variant="secondary" className="text-[0.625rem]">
              {USER_MANAGEMENT_CLIENT.YOUR_ACCOUNT}
            </Badge>
          ) : null}
          {user.blocked ? (
            <Badge variant="destructive" className="text-[0.625rem]">
              {USER_MANAGEMENT_CLIENT.BLOCKED_BADGE}
            </Badge>
          ) : null}
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      }
      action={action}
    />
  );
}
