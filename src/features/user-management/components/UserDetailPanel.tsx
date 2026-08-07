"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, ShieldCheckIcon, ShieldOffIcon, Trash2Icon } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { PRIVATE_ROUTES } from "@/constants/routes";

import { blockOrgUserAction, unblockOrgUserAction } from "../actions/server/block-org-user";
import { deleteOrgUserAction } from "../actions/server/delete-org-user";
import { updateOrgUserRoleAction } from "../actions/server/update-org-user";
import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import type { ManagedRole, OrgBuildingOption, OrgUserDetail } from "../types/user-management.types";
import { UserAccessSection } from "./UserAccessSection";
import { UserInviteStatus } from "./UserInviteStatus";
import { UserSummaryCard } from "./UserSummaryCard";

type UserDetailPanelProps = {
  user: OrgUserDetail;
  buildingOptions: OrgBuildingOption[];
};

export function UserDetailPanel({ user, buildingOptions }: UserDetailPanelProps) {
  const router = useRouter();
  const canManage = user.role !== "owner" && !user.isSelf;

  const [isUpdatingRole, startRoleUpdate] = useTransition();
  const [isBlocking, startBlock] = useTransition();
  const [isRemoving, startRemove] = useTransition();
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);

  const onRoleChange = (role: ManagedRole) => {
    startRoleUpdate(async () => {
      await updateOrgUserRoleAction(user.id, role);
    });
  };

  const onBlock = () => {
    startBlock(async () => {
      await blockOrgUserAction(user.id);
      setIsBlockOpen(false);
    });
  };

  const onUnblock = () => {
    startBlock(async () => {
      await unblockOrgUserAction(user.id);
    });
  };

  const onRemove = () => {
    startRemove(async () => {
      const result = await deleteOrgUserAction(user.id);
      if (result?.isSuccess) router.push(PRIVATE_ROUTES.USERS);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <UserSummaryCard
        user={user}
        action={
          canManage ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={user.blocked ? onUnblock : () => setIsBlockOpen(true)}
                disabled={isBlocking}
              >
                {isBlocking ? (
                  <Loader2Icon className="animate-spin" />
                ) : user.blocked ? (
                  <ShieldCheckIcon />
                ) : (
                  <ShieldOffIcon />
                )}
                {user.blocked ? USER_MANAGEMENT_CLIENT.UNBLOCK_USER : USER_MANAGEMENT_CLIENT.BLOCK_USER}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setIsRemoveOpen(true)}
                disabled={isRemoving}
              >
                {isRemoving ? <Loader2Icon className="animate-spin" /> : <Trash2Icon />}
                {USER_MANAGEMENT_CLIENT.REMOVE_USER}
              </Button>
            </div>
          ) : null
        }
      />

      {user.blocked ? (
        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {USER_MANAGEMENT_CLIENT.BLOCKED_NOTICE}
        </p>
      ) : null}

      {canManage ? (
        <UserAccessSection
          user={user}
          buildingOptions={buildingOptions}
          onRoleChange={onRoleChange}
          isUpdatingRole={isUpdatingRole}
        />
      ) : null}

      <UserInviteStatus inviteHistory={user.inviteHistory} />

      <AlertDialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{USER_MANAGEMENT_CLIENT.BLOCK_USER}?</AlertDialogTitle>
            <AlertDialogDescription>{USER_MANAGEMENT_CLIENT.BLOCKED_NOTICE}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking}>{USER_MANAGEMENT_CLIENT.CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isBlocking}
              onClick={onBlock}
            >
              {isBlocking ? <Loader2Icon className="animate-spin" /> : <ShieldOffIcon />}
              {USER_MANAGEMENT_CLIENT.BLOCK_USER}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </div>
  );
}
