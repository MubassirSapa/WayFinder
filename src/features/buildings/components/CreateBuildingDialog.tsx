"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PlusIcon } from "lucide-react";

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
import { PRIVATE_ROUTES } from "@/constants/routes";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";
import { createBuildingAction } from "../actions/server/create-building";

export function CreateBuildingDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setAddress("");
    setError("");
  };

  const submit = () => {
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("address", address.trim());
      formData.set("contactEmail", "");
      formData.set("contactPhone", "");
      formData.set("website", "");

      const result = await createBuildingAction(formData);
      if (!result?.isSuccess) {
        setError(result?.message || BUILDINGS_CLIENT.ERROR_CREATE_FAILED);
        return;
      }

      reset();
      setOpen(false);
      router.push(`${PRIVATE_ROUTES.BUILDINGS}/${result.data.id}`);
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
      <DialogTrigger render={<Button size="lg" />}>
        <PlusIcon />
        {BUILDINGS_CLIENT.ADD_BUILDING}
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{BUILDINGS_CLIENT.CREATE_DIALOG_TITLE}</DialogTitle>
            <DialogDescription>{BUILDINGS_CLIENT.CREATE_DIALOG_DESC}</DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4">
            <Field>
              <FieldLabel htmlFor="building-name">{BUILDINGS_CLIENT.FIELD_NAME_LABEL}</FieldLabel>
              <Input
                id="building-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={BUILDINGS_CLIENT.FIELD_NAME_PLACEHOLDER}
                disabled={isPending}
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="building-address">{BUILDINGS_CLIENT.FIELD_ADDRESS_LABEL}</FieldLabel>
              <Input
                id="building-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder={BUILDINGS_CLIENT.FIELD_ADDRESS_PLACEHOLDER}
                disabled={isPending}
              />
            </Field>
            <FormAlert errorMessage={error} />
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              {BUILDINGS_CLIENT.CANCEL}
            </Button>
            <Button type="submit" disabled={isPending || name.trim().length < 2}>
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? BUILDINGS_CLIENT.CREATING : BUILDINGS_CLIENT.CREATE}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
