"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Layers3Icon, Loader2Icon } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

import { createFloorAction } from "../actions/server/create-floor";
import {
  BUILDINGS_CLIENT,
  LEVEL_DEFAULT,
  LEVEL_OPTIONS,
} from "../constants/buildings.constants";

type AddFloorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  organizationName?: string;
};

const DEFAULT_LEVEL = String(LEVEL_DEFAULT);

export function AddFloorDialog({
  open,
  onOpenChange,
  buildingId,
  organizationName,
}: AddFloorDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [publish, setPublish] = useState(false);
  const [error, setError] = useState("");
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const hasUnsavedInput =
    name.trim().length > 0 || level !== DEFAULT_LEVEL || publish;

  const reset = () => {
    setName("");
    setLevel(DEFAULT_LEVEL);
    setPublish(false);
    setError("");
  };

  const submit = () => {
    setError("");
    startTransition(async () => {
      const result = await createFloorAction({
        name: name.trim(),
        level: Number(level),
        buildingId,
        publish,
      });
      if (!result?.isSuccess) {
        setError(result?.message || BUILDINGS_CLIENT.ERROR_CREATE_FLOOR_FAILED);
        return;
      }

      reset();
      onOpenChange(false);
      toast.success(BUILDINGS_CLIENT.SUCCESS_FLOOR_CREATED);
      router.refresh();
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

          onOpenChange(next);
          if (!next) reset();
        }}
      >
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
                  <Layers3Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {BUILDINGS_CLIENT.CREATE_FLOOR_DIALOG_TITLE}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm">
                    {organizationName ||
                      BUILDINGS_CLIENT.CREATE_FLOOR_DIALOG_DESC}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 px-5 py-5 sm:px-6">
              <Field>
                <FieldLabel htmlFor="floor-name">
                  {BUILDINGS_CLIENT.CREATE_FLOOR_FIELD_NAME_LABEL}
                </FieldLabel>
                <Input
                  id="floor-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={
                    BUILDINGS_CLIENT.CREATE_FLOOR_FIELD_NAME_PLACEHOLDER
                  }
                  disabled={isPending}
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="floor-level">
                  {BUILDINGS_CLIENT.FIELD_LEVEL_LABEL}
                </FieldLabel>
                <Select
                  value={level}
                  onValueChange={(value) =>
                    setLevel(String(value ?? DEFAULT_LEVEL))
                  }
                >
                  <SelectTrigger
                    id="floor-level"
                    className="h-11 w-full"
                    disabled={isPending}
                  >
                    <SelectValue>
                      {(value: string | null) =>
                        LEVEL_OPTIONS.find(
                          (option) => String(option.value) === value,
                        )?.label ?? BUILDINGS_CLIENT.FIELD_LEVEL_LABEL
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field className="flex-row items-center justify-between border-y border-border py-3">
                <div>
                  <FieldLabel htmlFor="floor-publish">
                    {BUILDINGS_CLIENT.FIELD_PUBLISH_TITLE}
                  </FieldLabel>
                  <FieldDescription>
                    {publish
                      ? BUILDINGS_CLIENT.FIELD_PUBLISH_ON
                      : BUILDINGS_CLIENT.FIELD_PUBLISH_OFF}
                  </FieldDescription>
                </div>
                <Switch
                  id="floor-publish"
                  checked={publish}
                  onCheckedChange={setPublish}
                  disabled={isPending}
                />
              </Field>

              <FormAlert errorMessage={error} />
            </div>

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
          onOpenChange(false);
        }}
        title={BUILDINGS_CLIENT.UNSAVED_FLOOR_TITLE}
        description={BUILDINGS_CLIENT.UNSAVED_FLOOR_DESC}
        cancelLabel={BUILDINGS_CLIENT.KEEP_EDITING}
        discardLabel={BUILDINGS_CLIENT.DISCARD}
      />
    </>
  );
}
