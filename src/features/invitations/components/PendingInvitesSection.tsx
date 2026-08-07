"use client";

import { useState, useTransition } from "react";
import { Loader2Icon, MailIcon, SendIcon, XIcon } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ROLE_LABELS } from "@/collections/constants/roles";

import { resendInvitationAction } from "../actions/server/resend-invitation";
import { revokeInvitationAction } from "../actions/server/revoke-invitation";
import { INVITATIONS_CLIENT } from "../constants/invitations.constants";
import type { PendingInvitationListItem } from "../types/invitation.types";

function formatExpiresAt(expiresAt: string) {
  return new Date(expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type PendingInviteRowProps = {
  invitation: PendingInvitationListItem;
};

function PendingInviteRow({ invitation }: PendingInviteRowProps) {
  const [isResending, startResend] = useTransition();
  const [isRevoking, startRevoke] = useTransition();
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);

  const onResend = () => {
    startResend(async () => {
      await resendInvitationAction(invitation.id);
    });
  };

  const onRevoke = () => {
    startRevoke(async () => {
      await revokeInvitationAction(invitation.id);
      setIsRevokeOpen(false);
    });
  };

  return (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-medium">{invitation.name}</p>
            <Badge variant="outline">{ROLE_LABELS[invitation.role]}</Badge>
            {invitation.isExpired ? (
              <Badge variant="secondary" className="text-[0.625rem] text-muted-foreground">
                {INVITATIONS_CLIENT.PENDING_EXPIRED_LABEL}
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground" title={invitation.email}>
            {invitation.email}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {invitation.isExpired
              ? `${INVITATIONS_CLIENT.PENDING_INVITED_BY_PREFIX} ${invitation.invitedByName}`
              : `${INVITATIONS_CLIENT.PENDING_EXPIRES_PREFIX} ${formatExpiresAt(invitation.expiresAt)} · ${INVITATIONS_CLIENT.PENDING_INVITED_BY_PREFIX} ${invitation.invitedByName}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  onClick={onResend}
                  disabled={isResending || isRevoking}
                  aria-label={`${INVITATIONS_CLIENT.RESEND}: ${invitation.name}`}
                />
              }
            >
              {isResending ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
            </TooltipTrigger>
            <TooltipContent>{INVITATIONS_CLIENT.RESEND}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setIsRevokeOpen(true)}
                  disabled={isResending || isRevoking}
                  aria-label={`${INVITATIONS_CLIENT.REVOKE}: ${invitation.name}`}
                />
              }
            >
              {isRevoking ? <Loader2Icon className="animate-spin" /> : <XIcon />}
            </TooltipTrigger>
            <TooltipContent>{INVITATIONS_CLIENT.REVOKE}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <AlertDialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{INVITATIONS_CLIENT.REVOKE_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {INVITATIONS_CLIENT.REVOKE_CONFIRM_PREFIX} {invitation.name}?{" "}
              {INVITATIONS_CLIENT.REVOKE_CONFIRM_SUFFIX}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>{INVITATIONS_CLIENT.CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRevoking}
              onClick={onRevoke}
            >
              {isRevoking ? <Loader2Icon className="animate-spin" /> : <XIcon />}
              {INVITATIONS_CLIENT.REVOKE}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type PendingInvitesSectionProps = {
  invitations: PendingInvitationListItem[];
};

export function PendingInvitesSection({ invitations }: PendingInvitesSectionProps) {
  if (invitations.length === 0) return null;

  return (
    <section>
      <h3 className="flex items-center gap-1.5 border-b border-border pb-2 font-heading text-sm font-semibold text-foreground">
        <MailIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        {INVITATIONS_CLIENT.PENDING_SECTION_TITLE}
        <span className="ml-0.5 font-normal text-muted-foreground">({invitations.length})</span>
      </h3>
      <div className="divide-y divide-border">
        {invitations.map((invitation) => (
          <PendingInviteRow key={invitation.id} invitation={invitation} />
        ))}
      </div>
    </section>
  );
}
