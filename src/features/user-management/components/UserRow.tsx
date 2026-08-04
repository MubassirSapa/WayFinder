"use client";

import { useTransition } from "react";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import { deleteOrgUserAction } from "../actions/server/delete-org-user";
import { updateOrgUserRoleAction } from "../actions/server/update-org-user";
import { BuildingsAssignmentPopover } from "./BuildingsAssignmentPopover";
import type { ManagedRole, OrgBuildingOption, OrgUserListItem } from "../types/user-management.types";

const ROLE_LABELS: Record<OrgUserListItem["role"], string> = {
  owner: USER_MANAGEMENT_CLIENT.ROLE_OWNER,
  manager: USER_MANAGEMENT_CLIENT.ROLE_MANAGER,
  member: USER_MANAGEMENT_CLIENT.ROLE_MEMBER,
};

type UserRowProps = {
  user: OrgUserListItem;
  buildingOptions: OrgBuildingOption[];
};

export function UserRow({ user, buildingOptions }: UserRowProps) {
  const [isUpdatingRole, startRoleUpdate] = useTransition();
  const [isRemoving, startRemove] = useTransition();

  const canManageThisRow = user.role !== "owner" && !user.isSelf;

  const onRoleChange = (role: ManagedRole) => {
    startRoleUpdate(async () => {
      await updateOrgUserRoleAction(user.id, role);
    });
  };

  const onRemove = () => {
    if (!window.confirm(USER_MANAGEMENT_CLIENT.REMOVE_CONFIRM)) return;
    startRemove(async () => {
      await deleteOrgUserAction(user.id);
    });
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
            <AvatarFallback>{user.name.trim()[0]?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        {canManageThisRow ? (
          <Select value={user.role} onValueChange={(value) => onRoleChange(value as ManagedRole)}>
            <SelectTrigger className="h-8 w-32" disabled={isUpdatingRole}>
              <SelectValue>{() => ROLE_LABELS[user.role]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">{USER_MANAGEMENT_CLIENT.ROLE_MANAGER}</SelectItem>
              <SelectItem value="member">{USER_MANAGEMENT_CLIENT.ROLE_MEMBER}</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
        )}
      </TableCell>

      <TableCell>
        {user.role === "member" ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {user.buildingNames.length > 0 ? (
              user.buildingNames.map((name) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">{USER_MANAGEMENT_CLIENT.NO_BUILDINGS}</span>
            )}
            <BuildingsAssignmentPopover
              userId={user.id}
              buildingOptions={buildingOptions}
              selectedBuildingIds={user.buildingIds}
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="text-end">
        {canManageThisRow ? (
          <Button variant="ghost" size="sm" onClick={onRemove} disabled={isRemoving}>
            {isRemoving ? <Loader2Icon className="animate-spin" /> : <Trash2Icon />}
            {USER_MANAGEMENT_CLIENT.REMOVE_USER}
          </Button>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
