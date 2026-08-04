"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";
import { updateFloorMetadataAction } from "../actions/server/update-floor-metadata";
import type { FloorEditData } from "../types/buildings.types";

type FloorMetadataFormProps = {
  floor: FloorEditData;
};

export function FloorMetadataForm({ floor }: FloorMetadataFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(floor.name);
  const [level, setLevel] = useState(String(floor.level));
  const [width, setWidth] = useState(String(floor.width));
  const [height, setHeight] = useState(String(floor.height));
  const [metersPerPixel, setMetersPerPixel] = useState(
    floor.metersPerPixel !== null ? String(floor.metersPerPixel) : "",
  );
  const [isPublished, setIsPublished] = useState(floor.status === "published");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = () => {
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("level", level);
      formData.set("width", width);
      formData.set("height", height);
      formData.set("metersPerPixel", metersPerPixel);
      formData.set("status", isPublished ? "published" : "draft");

      const result = await updateFloorMetadataAction(floor.buildingId, floor.id, formData);
      if (!result?.isSuccess) {
        setError(result?.message || BUILDINGS_CLIENT.ERROR_FLOOR_UPDATE_FAILED);
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold tracking-tight">{BUILDINGS_CLIENT.FLOOR_FORM_TITLE}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{BUILDINGS_CLIENT.FLOOR_FORM_DESC}</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="mt-6"
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="floor-name">{BUILDINGS_CLIENT.FIELD_FLOOR_NAME_LABEL}</FieldLabel>
            <Input
              id="floor-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="floor-level">{BUILDINGS_CLIENT.FIELD_LEVEL_LABEL}</FieldLabel>
              <Input
                id="floor-level"
                type="number"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="floor-meters-per-pixel">
                {BUILDINGS_CLIENT.FIELD_METERS_PER_PIXEL_LABEL}
              </FieldLabel>
              <Input
                id="floor-meters-per-pixel"
                type="number"
                step="0.01"
                min="0"
                value={metersPerPixel}
                onChange={(event) => setMetersPerPixel(event.target.value)}
                disabled={isPending}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="floor-width">{BUILDINGS_CLIENT.FIELD_WIDTH_LABEL}</FieldLabel>
              <Input
                id="floor-width"
                type="number"
                min="1"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="floor-height">{BUILDINGS_CLIENT.FIELD_HEIGHT_LABEL}</FieldLabel>
              <Input
                id="floor-height"
                type="number"
                min="1"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                disabled={isPending}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-4">
            <div>
              <p className="text-sm font-medium">{BUILDINGS_CLIENT.FIELD_STATUS_LABEL}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isPublished ? BUILDINGS_CLIENT.STATUS_PUBLISHED : BUILDINGS_CLIENT.STATUS_DRAFT}
              </p>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} disabled={isPending} />
          </div>

          {success ? <FormAlert successMessage={BUILDINGS_CLIENT.SUCCESS_FLOOR_UPDATED} /> : null}
          <FormAlert errorMessage={error} />

          <Button type="submit" size="lg" disabled={isPending || name.trim().length < 2}>
            {isPending ? <Loader2Icon className="animate-spin" /> : null}
            {isPending ? BUILDINGS_CLIENT.SAVING : BUILDINGS_CLIENT.SAVE}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
