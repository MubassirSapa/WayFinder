import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROLE_LABELS } from "@/collections/constants/roles";
import { PRIVATE_ROUTES } from "@/constants/routes";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import { userInitials } from "../lib/user-management-presentation";
import type { OrgUserListItem } from "../types/user-management.types";

type TeamMemberCardProps = {
  user: OrgUserListItem;
};

export function TeamMemberCard({ user }: TeamMemberCardProps) {
  return (
    <Link href={`${PRIVATE_ROUTES.USERS}/${user.id}`} className="block min-w-0">
      <Card className="min-w-0 gap-0 p-4 shadow-none transition-colors hover:bg-accent/40">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-11" size="lg">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
            <AvatarFallback className="bg-primary/10 font-medium text-primary">
              {userInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading text-sm font-semibold">{user.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
              {user.isSelf ? (
                <Badge variant="secondary" className="text-[0.625rem]">
                  {USER_MANAGEMENT_CLIENT.YOUR_ACCOUNT}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground" title={user.email}>
              {user.email}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
