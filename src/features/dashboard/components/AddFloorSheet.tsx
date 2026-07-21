"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, XIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  DASHBOARD_CLIENT,
  LEVEL_DEFAULT,
  LEVEL_OPTIONS,
} from "../constants/dashboard.constants";
import { createFloorAction } from "../actions/server/create-floor";

type AddFloorSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
  organizationName?: string;
};

const DEFAULT_LEVEL = String(LEVEL_DEFAULT);

export function AddFloorSheet({
  open,
  onOpenChange,
  buildingId,
  organizationName,
}: AddFloorSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [publish, setPublish] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

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
        setError(result?.message || DASHBOARD_CLIENT.ERROR_CREATE_FAILED);
        return;
      }
      reset();
      onOpenChange(false);
      router.refresh();
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={DASHBOARD_CLIENT.CLOSE}
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px] animate-in fade-in-0 duration-200"
      />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-card shadow-xl animate-in fade-in-0 slide-in-from-right duration-200">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5">
          <div>
            <h2 className="font-heading text-lg font-semibold">{DASHBOARD_CLIENT.SHEET_TITLE}</h2>
            {organizationName ? (
              <p className="mt-1 text-sm text-muted-foreground">{organizationName}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label={DASHBOARD_CLIENT.CLOSE}
          >
            <XIcon />
          </Button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="floor-name">{DASHBOARD_CLIENT.FIELD_NAME_LABEL}</Label>
              <Input
                id="floor-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={DASHBOARD_CLIENT.FIELD_NAME_PLACEHOLDER}
                className="h-10"
                disabled={isPending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor-level">{DASHBOARD_CLIENT.FIELD_LEVEL_LABEL}</Label>
              <Select value={level} onValueChange={(value) => setLevel(String(value ?? DEFAULT_LEVEL))}>
                <SelectTrigger id="floor-level" className="h-10 w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      LEVEL_OPTIONS.find((option) => String(option.value) === value)?.label ??
                      DASHBOARD_CLIENT.FIELD_LEVEL_LABEL
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-4">
              <div>
                <p className="text-sm font-medium">{DASHBOARD_CLIENT.FIELD_PUBLISH_TITLE}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {publish ? DASHBOARD_CLIENT.FIELD_PUBLISH_ON : DASHBOARD_CLIENT.FIELD_PUBLISH_OFF}
                </p>
              </div>
              <Switch checked={publish} onCheckedChange={setPublish} disabled={isPending} />
            </div>

            <FormAlert errorMessage={error} />
          </div>

          <div className="flex gap-3 border-t border-border px-5 py-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {DASHBOARD_CLIENT.CANCEL}
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-[1.4]"
              disabled={isPending || name.trim().length < 2}
            >
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? DASHBOARD_CLIENT.CREATING : DASHBOARD_CLIENT.CREATE}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
