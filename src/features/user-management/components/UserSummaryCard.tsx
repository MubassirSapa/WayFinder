import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        <Avatar className="size-16 sm:size-18" size="lg">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
          <AvatarFallback className="bg-primary/10 text-xl font-medium text-primary">
            {userInitials(user.name)}
          </AvatarFallback>
        </Avatar>
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
