"use client";

import { useState, useTransition } from "react";
import {
  Building2Icon,
  Loader2Icon,
  PlusIcon,
  ShieldCheckIcon,
  UserRoundPlusIcon,
} from "lucide-react";

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

import { createOrgUserAction } from "../actions/server/create-org-user";
import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import type {
  ManagedRole,
  OrgBuildingOption,
} from "../types/user-management.types";

const ROLE_LABELS: Record<ManagedRole, string> = {
  manager: USER_MANAGEMENT_CLIENT.ROLE_MANAGER,
  member: USER_MANAGEMENT_CLIENT.ROLE_MEMBER,
};

type AddTeamMemberDialogProps = {
  buildingOptions: OrgBuildingOption[];
};

export function AddTeamMemberDialog({ buildingOptions }: AddTeamMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ManagedRole>("member");
  const [buildingIds, setBuildingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
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
      formData.set("password", password);
      formData.set("role", role);
      for (const id of buildingIds) formData.append("buildingIds", id);

      const result = await createOrgUserAction(formData);
      if (!result?.isSuccess) {
        setError(result?.message || USER_MANAGEMENT_CLIENT.ERROR_CREATE_FAILED);
        return;
      }

      reset();
      setOpen(false);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button className="h-10 px-4" />}>
        <PlusIcon />
        {USER_MANAGEMENT_CLIENT.ADD_USER}
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
                  {USER_MANAGEMENT_CLIENT.CREATE_DIALOG_TITLE}
                </DialogTitle>
                <DialogDescription className="mt-1 max-w-lg text-sm">
                  {USER_MANAGEMENT_CLIENT.CREATE_DIALOG_DESC}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 overflow-y-auto">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <section className="space-y-4 px-5 py-5 sm:px-6 lg:border-e lg:border-border">
                <div>
                  <h3 className="font-heading text-sm font-semibold">
                    {USER_MANAGEMENT_CLIENT.ACCOUNT_DETAILS}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {USER_MANAGEMENT_CLIENT.ACCOUNT_DETAILS_DESC}
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="new-user-name">
                    {USER_MANAGEMENT_CLIENT.FIELD_NAME_LABEL}
                  </FieldLabel>
                  <Input
                    id="new-user-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={USER_MANAGEMENT_CLIENT.FIELD_NAME_PLACEHOLDER}
                    disabled={isPending}
                    autoComplete="name"
                    autoFocus
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="new-user-email">
                    {USER_MANAGEMENT_CLIENT.FIELD_EMAIL_LABEL}
                  </FieldLabel>
                  <Input
                    id="new-user-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={USER_MANAGEMENT_CLIENT.FIELD_EMAIL_PLACEHOLDER}
                    disabled={isPending}
                    autoComplete="email"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="new-user-password">
                    {USER_MANAGEMENT_CLIENT.FIELD_PASSWORD_LABEL}
                  </FieldLabel>
                  <Input
                    id="new-user-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={USER_MANAGEMENT_CLIENT.FIELD_PASSWORD_PLACEHOLDER}
                    disabled={isPending}
                    autoComplete="new-password"
                  />
                  <FieldDescription>
                    {USER_MANAGEMENT_CLIENT.FIELD_PASSWORD_DESC}
                  </FieldDescription>
                </Field>
              </section>

              <section className="space-y-4 border-t border-border px-5 py-5 sm:px-6 lg:border-t-0">
                <div>
                  <h3 className="font-heading text-sm font-semibold">
                    {USER_MANAGEMENT_CLIENT.ACCESS_DETAILS}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {USER_MANAGEMENT_CLIENT.ACCESS_DETAILS_DESC}
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="new-user-role">
                    <ShieldCheckIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                    {USER_MANAGEMENT_CLIENT.FIELD_ROLE_LABEL}
                  </FieldLabel>
                  <Select
                    value={role}
                    onValueChange={(value) => setRole((value as ManagedRole) ?? role)}
                  >
                    <SelectTrigger id="new-user-role" className="h-10 w-full" disabled={isPending}>
                      <SelectValue>{() => ROLE_LABELS[role]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">
                        {USER_MANAGEMENT_CLIENT.ROLE_MANAGER}
                      </SelectItem>
                      <SelectItem value="member">
                        {USER_MANAGEMENT_CLIENT.ROLE_MEMBER}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {role === "manager"
                      ? USER_MANAGEMENT_CLIENT.ROLE_MANAGER_DESC
                      : USER_MANAGEMENT_CLIENT.ROLE_MEMBER_DESC}
                  </FieldDescription>
                </Field>

                {role === "member" ? (
                  <Field>
                    <FieldLabel>
                      <Building2Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                      {USER_MANAGEMENT_CLIENT.FIELD_BUILDINGS_LABEL}
                    </FieldLabel>
                    <FieldDescription>
                      {USER_MANAGEMENT_CLIENT.FIELD_BUILDINGS_DESC}
                    </FieldDescription>

                    <div className="divide-y divide-border border-y border-border">
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
                          {USER_MANAGEMENT_CLIENT.NO_BUILDINGS_AVAILABLE}
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

          <DialogFooter className="border-t border-border bg-muted/30 px-5 py-4 sm:px-6">
            <DialogClose
              render={<Button type="button" variant="outline" disabled={isPending} />}
            >
              {USER_MANAGEMENT_CLIENT.CANCEL}
            </DialogClose>
            <Button
              type="submit"
              disabled={
                isPending ||
                name.trim().length < 2 ||
                !email.trim() ||
                password.length < 8
              }
            >
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? USER_MANAGEMENT_CLIENT.CREATING : USER_MANAGEMENT_CLIENT.CREATE}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
