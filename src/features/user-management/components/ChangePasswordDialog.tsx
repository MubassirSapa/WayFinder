"use client";

import { useState } from "react";
import { KeyRoundIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { changeOwnPasswordAction } from "../actions/server/change-password";
import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";

// Self-service only, deliberately - an owner/manager directly setting
// another user's password (no proof they know the old one) was cut for
// security reasons: it's a silent account-takeover vector with no
// notification or re-auth step. Everyone, any role, can only ever change
// their own password, proven with the current one first.
export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
  };

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const submit = async () => {
    setError("");
    setIsPending(true);

    const result = await changeOwnPasswordAction(currentPassword, newPassword, confirmNewPassword);

    setIsPending(false);

    if (!result?.isSuccess) {
      setError(result?.message || USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);
      return;
    }

    toast.success(USER_MANAGEMENT_CLIENT.SUCCESS_PASSWORD_CHANGED);
    setOpen(false);
    reset();
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger render={<Button size="sm" type="button" variant="outline" />}>
        <KeyRoundIcon />
        {USER_MANAGEMENT_CLIENT.CHANGE_PASSWORD}
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-sm">
        <DialogHeader className="border-b border-border px-5 py-5 pe-14 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <KeyRoundIcon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <DialogTitle className="text-lg font-semibold">{USER_MANAGEMENT_CLIENT.CHANGE_PASSWORD_TITLE}</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                {USER_MANAGEMENT_CLIENT.CHANGE_PASSWORD_DESCRIPTION_SELF}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <FieldGroup className="gap-4 px-5 py-5 sm:px-6">
            <Field>
              <FieldLabel htmlFor="current-password">
                {USER_MANAGEMENT_CLIENT.FIELD_CURRENT_PASSWORD_LABEL}
              </FieldLabel>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={isPending}
                autoComplete="current-password"
                className="h-11"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="new-password">{USER_MANAGEMENT_CLIENT.FIELD_NEW_PASSWORD_LABEL}</FieldLabel>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={isPending}
                autoComplete="new-password"
                className="h-11"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-new-password">
                {USER_MANAGEMENT_CLIENT.FIELD_CONFIRM_PASSWORD_LABEL}
              </FieldLabel>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                disabled={isPending}
                autoComplete="new-password"
                className="h-11"
              />
            </Field>

            <FormAlert errorMessage={error} />
          </FieldGroup>

          <DialogFooter className="border-t border-border bg-muted/30 px-5 py-4 sm:px-6 [&_button]:h-11">
            <Button disabled={isPending || !currentPassword || !newPassword || !confirmNewPassword} type="submit">
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? USER_MANAGEMENT_CLIENT.SAVING : USER_MANAGEMENT_CLIENT.SAVE}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
