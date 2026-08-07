"use client";

import { useState, useTransition } from "react";
import {
  Building2Icon,
  Loader2Icon,
  PlusIcon,
  ShieldCheckIcon,
  UserRoundPlusIcon,
} from "lucide-react";
import { toast } from "sonner";

import { DiscardChangesAlertDialog } from "@/components/shared/form/DiscardChangesAlertDialog";
import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/collections/constants/roles";
import { inviteUserAction } from "@/features/invitations/actions/server/invite-user";
import { INVITATIONS_CLIENT } from "@/features/invitations/constants/invitations.constants";
import type { InvitationRole } from "@/features/invitations/types/invitation.types";

import type { OrgBuildingOption } from "../types/user-management.types";

type AddTeamMemberDialogProps = {
  buildingOptions: OrgBuildingOption[];
};

export function AddTeamMemberDialog({ buildingOptions }: AddTeamMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole>("member");
  const [buildingIds, setBuildingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const hasUnsavedInput =
    name.trim().length > 0 ||
    email.trim().length > 0 ||
    role !== "member" ||
    buildingIds.size > 0;

  const reset = () => {
    setName("");
    setEmail("");
    setRole("member");
    setBuildingIds(new Set());
    setError("");
  };

  const toggleBuilding = (buildingId: string, checked: boolean) => {
    setBuildingIds((current) => {
      const next = new Set(current);
      if (checked) next.add(buildingId);
      else next.delete(buildingId);
      return next;
    });
  };

  const submit = () => {
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("email", email.trim());
      formData.set("role", role);
      for (const id of buildingIds) formData.append("buildingIds", id);

      const result = await inviteUserAction(formData);
      if (!result?.isSuccess) {
        setError(result?.message || INVITATIONS_CLIENT.ERROR_INVITE_FAILED);
        return;
      }

      reset();
      setOpen(false);
      toast.success(INVITATIONS_CLIENT.SUCCESS_INVITED);
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next, eventDetails) => {
          if (!next && hasUnsavedInput) {
            eventDetails.cancel();
            setIsDiscardOpen(true);
            return;
          }

          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogTrigger render={<Button className="h-11 px-5" />}>
          <PlusIcon />
          {INVITATIONS_CLIENT.INVITE_USER_TRIGGER}
        </DialogTrigger>

        <DialogContent className="max-h-[calc(100svh-1rem)] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            className="flex min-h-0 flex-col"
          >
            <DialogHeader className="border-b border-border px-5 py-5 pe-14 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserRoundPlusIcon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="text-lg font-semibold">
                    {INVITATIONS_CLIENT.INVITE_DIALOG_TITLE}
                  </DialogTitle>
                  <DialogDescription className="mt-1 max-w-lg text-sm">
                    {INVITATIONS_CLIENT.INVITE_DIALOG_DESC}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 overflow-y-auto">
              <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                <section className="space-y-4 px-5 py-5 sm:px-6 lg:border-e lg:border-border">
                  <div>
                    <h3 className="font-heading text-sm font-semibold">
                      {INVITATIONS_CLIENT.ACCOUNT_DETAILS}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {INVITATIONS_CLIENT.ACCOUNT_DETAILS_DESC}
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="new-user-name">
                      {INVITATIONS_CLIENT.FIELD_NAME_LABEL}
                    </FieldLabel>
                    <Input
                      id="new-user-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={INVITATIONS_CLIENT.FIELD_NAME_PLACEHOLDER}
                      disabled={isPending}
                      autoComplete="name"
                      autoFocus
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="new-user-email">
                      {INVITATIONS_CLIENT.FIELD_EMAIL_LABEL}
                    </FieldLabel>
                    <Input
                      id="new-user-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={INVITATIONS_CLIENT.FIELD_EMAIL_PLACEHOLDER}
                      disabled={isPending}
                      autoComplete="email"
                    />
                  </Field>
                </section>

                <section className="space-y-4 border-t border-border px-5 py-5 sm:px-6 lg:border-t-0">
                  <div>
                    <h3 className="font-heading text-sm font-semibold">
                      {INVITATIONS_CLIENT.ACCESS_DETAILS}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {INVITATIONS_CLIENT.ACCESS_DETAILS_DESC}
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="new-user-role">
                      <ShieldCheckIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                      {INVITATIONS_CLIENT.FIELD_ROLE_LABEL}
                    </FieldLabel>
                    <Select
                      value={role}
                      onValueChange={(value) => setRole((value as InvitationRole) ?? role)}
                    >
                      <SelectTrigger id="new-user-role" className="h-11 w-full" disabled={isPending}>
                        <SelectValue>{() => ROLE_LABELS[role]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">{INVITATIONS_CLIENT.ROLE_MANAGER}</SelectItem>
                        <SelectItem value="member">{INVITATIONS_CLIENT.ROLE_MEMBER}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      {role === "manager"
                        ? INVITATIONS_CLIENT.ROLE_MANAGER_DESC
                        : INVITATIONS_CLIENT.ROLE_MEMBER_DESC}
                    </FieldDescription>
                  </Field>

                  {role === "member" ? (
                    <Field>
                      <FieldLabel>
                        <Building2Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                        {INVITATIONS_CLIENT.FIELD_BUILDINGS_LABEL}
                      </FieldLabel>
                      <FieldDescription>{INVITATIONS_CLIENT.FIELD_BUILDINGS_DESC}</FieldDescription>

                      <div className="divide-y divide-border rounded-md border border-border px-3">
                        {buildingOptions.length > 0 ? (
                          buildingOptions.map((building) => (
                            <label
                              key={building.id}
                              className="flex min-h-12 cursor-pointer items-center gap-3 py-2.5 text-sm"
                            >
                              <Checkbox
                                checked={buildingIds.has(building.id)}
                                onCheckedChange={(checked) =>
                                  toggleBuilding(building.id, checked === true)
                                }
                                disabled={isPending}
                              />
                              <span className="min-w-0 truncate">{building.name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="py-3 text-xs text-muted-foreground">
                            {INVITATIONS_CLIENT.NO_BUILDINGS_AVAILABLE}
                          </p>
                        )}
                      </div>
                    </Field>
                  ) : null}
                </section>
              </div>

              <div className="px-5 sm:px-6">
                <FormAlert errorMessage={error} />
              </div>
            </div>

            <DialogFooter className="border-t border-border bg-muted/30 px-5 py-4 sm:px-6 [&_button]:h-11 [&_button]:px-5">
              <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
                {INVITATIONS_CLIENT.CANCEL}
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending || name.trim().length < 2 || !email.trim()}
              >
                {isPending ? <Loader2Icon className="animate-spin" /> : null}
                {isPending ? INVITATIONS_CLIENT.SENDING_INVITE : INVITATIONS_CLIENT.SEND_INVITE}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DiscardChangesAlertDialog
        open={isDiscardOpen}
        onOpenChange={setIsDiscardOpen}
        onDiscard={() => {
          reset();
          setOpen(false);
        }}
        title={INVITATIONS_CLIENT.UNSAVED_INVITE_TITLE}
        description={INVITATIONS_CLIENT.UNSAVED_INVITE_DESC}
        cancelLabel={INVITATIONS_CLIENT.KEEP_EDITING}
        discardLabel={INVITATIONS_CLIENT.DISCARD}
      />
    </>
  );
}
