"use client";

import { useState, useTransition } from "react";
import { Building2Icon, Loader2Icon, Settings2Icon, Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { deleteOrgUserAction } from "../actions/server/delete-org-user";
import { updateOrgUserRoleAction } from "../actions/server/update-org-user";
import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import { userInitials } from "../lib/user-management-presentation";
import type {
  ManagedRole,
  OrgBuildingOption,
  OrgUserListItem,
} from "../types/user-management.types";
import { BuildingsAssignmentPopover } from "./BuildingsAssignmentPopover";

const ROLE_LABELS: Record<OrgUserListItem["role"], string> = {
  owner: USER_MANAGEMENT_CLIENT.ROLE_OWNER,
  manager: USER_MANAGEMENT_CLIENT.ROLE_MANAGER,
  member: USER_MANAGEMENT_CLIENT.ROLE_MEMBER,
};

type TeamMemberCardProps = {
  user: OrgUserListItem;
  buildingOptions: OrgBuildingOption[];
};

export function TeamMemberCard({ user, buildingOptions }: TeamMemberCardProps) {
  const [isUpdatingRole, startRoleUpdate] = useTransition();
  const [isRemoving, startRemove] = useTransition();
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const canManage = user.role !== "owner" && !user.isSelf;

  const onRoleChange = (role: ManagedRole) => {
    startRoleUpdate(async () => {
      await updateOrgUserRoleAction(user.id, role);
    });
  };

  const onRemove = () => {
    startRemove(async () => {
      await deleteOrgUserAction(user.id);
    });
  };

  return (
    <>
      <Card className="min-w-0 gap-0 p-4 shadow-none">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-11" size="lg">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
            <AvatarFallback className="bg-primary/10 font-medium text-primary">
              {userInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <h2 className="truncate font-heading text-sm font-semibold">{user.name}</h2>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground" title={user.email}>
              {user.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
              {user.isSelf ? (
                <Badge variant="secondary" className="text-[0.625rem]">
                  {USER_MANAGEMENT_CLIENT.YOUR_ACCOUNT}
                </Badge>
              ) : null}
            </div>
          </div>

          {canManage ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setIsRemoveOpen(true)}
                    disabled={isRemoving}
                    aria-label={`${USER_MANAGEMENT_CLIENT.REMOVE_USER_LABEL}: ${user.name}`}
                  />
                }
              >
                {isRemoving ? <Loader2Icon className="animate-spin" /> : <Trash2Icon />}
              </TooltipTrigger>
              <TooltipContent>{USER_MANAGEMENT_CLIENT.REMOVE_USER}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>

        <div className="mt-4 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <Building2Icon className="size-3.5 shrink-0" aria-hidden="true" />
          <span
            className="truncate"
            title={
              user.role === "member" && user.buildingNames.length > 0
                ? user.buildingNames.join(", ")
                : undefined
            }
          >
            {user.role === "member"
              ? user.buildingNames.length > 0
                ? user.buildingNames.join(", ")
                : USER_MANAGEMENT_CLIENT.NO_BUILDINGS
              : USER_MANAGEMENT_CLIENT.ORGANIZATION_ACCESS}
          </span>
        </div>

        {canManage ? (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Settings2Icon className="size-3.5" aria-hidden="true" />
              {USER_MANAGEMENT_CLIENT.EDIT_ACCESS}
            </div>
            <Select value={user.role} onValueChange={(value) => onRoleChange(value as ManagedRole)}>
              <SelectTrigger className="h-10 w-full" disabled={isUpdatingRole}>
                <SelectValue>{() => ROLE_LABELS[user.role]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">{USER_MANAGEMENT_CLIENT.ROLE_MANAGER}</SelectItem>
                <SelectItem value="member">{USER_MANAGEMENT_CLIENT.ROLE_MEMBER}</SelectItem>
              </SelectContent>
            </Select>

            {user.role === "member" ? (
              <BuildingsAssignmentPopover
                userId={user.id}
                buildingOptions={buildingOptions}
                selectedBuildingIds={user.buildingIds}
              />
            ) : null}
          </div>
        ) : null}
      </Card>

      <AlertDialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{USER_MANAGEMENT_CLIENT.REMOVE_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {USER_MANAGEMENT_CLIENT.REMOVE_CONFIRM_PREFIX} {user.name}?{" "}
              {USER_MANAGEMENT_CLIENT.REMOVE_CONFIRM_SUFFIX}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>{USER_MANAGEMENT_CLIENT.CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRemoving}
              onClick={onRemove}
            >
              {isRemoving ? <Loader2Icon className="animate-spin" /> : <Trash2Icon />}
              {USER_MANAGEMENT_CLIENT.REMOVE_USER}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
