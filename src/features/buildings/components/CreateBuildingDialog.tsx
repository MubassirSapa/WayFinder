"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Building2Icon, Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { DiscardChangesAlertDialog } from "@/components/shared/form/DiscardChangesAlertDialog";
import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
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
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const hasUnsavedInput = name.trim().length > 0 || address.trim().length > 0;

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
      toast.success(BUILDINGS_CLIENT.SUCCESS_CREATED);
      router.push(`${PRIVATE_ROUTES.BUILDINGS}/${result.data.id}`);
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
          {BUILDINGS_CLIENT.ADD_BUILDING}
        </DialogTrigger>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <DialogHeader className="border-b border-border px-5 py-5 pe-14 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Building2Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {BUILDINGS_CLIENT.CREATE_DIALOG_TITLE}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm">
                    {BUILDINGS_CLIENT.CREATE_DIALOG_DESC}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <FieldGroup className="px-5 py-5 sm:px-6">
              <Field>
                <FieldLabel htmlFor="building-name">
                  {BUILDINGS_CLIENT.FIELD_NAME_LABEL}
                </FieldLabel>
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
                <FieldLabel htmlFor="building-address">
                  {BUILDINGS_CLIENT.FIELD_ADDRESS_LABEL}
                </FieldLabel>
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

            <DialogFooter className="border-t border-border bg-muted/30 px-5 py-4 sm:px-6 [&_button]:h-11 [&_button]:px-5">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                  />
                }
              >
                {BUILDINGS_CLIENT.CANCEL}
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending || name.trim().length < 2}
              >
                {isPending ? <Loader2Icon className="animate-spin" /> : null}
                {isPending
                  ? BUILDINGS_CLIENT.CREATING
                  : BUILDINGS_CLIENT.CREATE}
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
        title={BUILDINGS_CLIENT.UNSAVED_BUILDING_TITLE}
        description={BUILDINGS_CLIENT.UNSAVED_BUILDING_DESC}
        cancelLabel={BUILDINGS_CLIENT.KEEP_EDITING}
        discardLabel={BUILDINGS_CLIENT.DISCARD}
      />
    </>
  );
}
