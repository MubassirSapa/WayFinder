"use client";

import { useState, useTransition } from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import { createOrgUserAction } from "../actions/server/create-org-user";
import type { ManagedRole, OrgBuildingOption } from "../types/user-management.types";

const ROLE_LABELS: Record<ManagedRole, string> = {
  manager: USER_MANAGEMENT_CLIENT.ROLE_MANAGER,
  member: USER_MANAGEMENT_CLIENT.ROLE_MEMBER,
};

type CreateUserSheetProps = {
  buildingOptions: OrgBuildingOption[];
};

export function CreateUserSheet({ buildingOptions }: CreateUserSheetProps) {
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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <SheetTrigger render={<Button size="lg" />}>
        <PlusIcon />
        {USER_MANAGEMENT_CLIENT.ADD_USER}
      </SheetTrigger>
      <SheetContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex h-full flex-col"
        >
          <SheetHeader>
            <SheetTitle>{USER_MANAGEMENT_CLIENT.CREATE_SHEET_TITLE}</SheetTitle>
            <SheetDescription>{USER_MANAGEMENT_CLIENT.CREATE_SHEET_DESC}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-user-name">{USER_MANAGEMENT_CLIENT.FIELD_NAME_LABEL}</FieldLabel>
                <Input
                  id="new-user-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={isPending}
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="new-user-email">{USER_MANAGEMENT_CLIENT.FIELD_EMAIL_LABEL}</FieldLabel>
                <Input
                  id="new-user-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="new-user-password">{USER_MANAGEMENT_CLIENT.FIELD_PASSWORD_LABEL}</FieldLabel>
                <Input
                  id="new-user-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isPending}
                />
                <FieldDescription>{USER_MANAGEMENT_CLIENT.FIELD_PASSWORD_DESC}</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="new-user-role">{USER_MANAGEMENT_CLIENT.FIELD_ROLE_LABEL}</FieldLabel>
                <Select value={role} onValueChange={(value) => setRole((value as ManagedRole) ?? role)}>
                  <SelectTrigger id="new-user-role" className="w-full" disabled={isPending}>
                    <SelectValue>{() => ROLE_LABELS[role]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">{USER_MANAGEMENT_CLIENT.ROLE_MANAGER}</SelectItem>
                    <SelectItem value="member">{USER_MANAGEMENT_CLIENT.ROLE_MEMBER}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {role === "member" ? (
                <Field>
                  <FieldLabel>{USER_MANAGEMENT_CLIENT.FIELD_BUILDINGS_LABEL}</FieldLabel>
                  <FieldDescription>{USER_MANAGEMENT_CLIENT.FIELD_BUILDINGS_DESC}</FieldDescription>
                  <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                    {buildingOptions.map((building) => (
                      <label key={building.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={buildingIds.has(building.id)}
                          onCheckedChange={(checked) => toggleBuilding(building.id, checked === true)}
                          disabled={isPending}
                        />
                        {building.name}
                      </label>
                    ))}
                  </div>
                </Field>
              ) : null}

              <FormAlert errorMessage={error} />
            </FieldGroup>
          </div>

          <SheetFooter>
            <Button
              type="submit"
              size="lg"
              disabled={isPending || name.trim().length < 2 || !email.trim() || password.length < 8}
            >
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? USER_MANAGEMENT_CLIENT.CREATING : USER_MANAGEMENT_CLIENT.CREATE}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
