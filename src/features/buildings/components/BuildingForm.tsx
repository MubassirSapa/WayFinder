"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { Building2Icon, Loader2Icon, UploadIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";
import { updateBuildingAction } from "../actions/server/update-building";
import type { BuildingEditData } from "../types/buildings.types";

type BuildingFormProps = {
  building: BuildingEditData;
};

export function BuildingForm({ building }: BuildingFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(building.name);
  const [address, setAddress] = useState(building.address ?? "");
  const [contactEmail, setContactEmail] = useState(building.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(building.contactPhone ?? "");
  const [website, setWebsite] = useState(building.website ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(building.logoUrl);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const readOnly = !building.canEdit;

  const onSelectLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(BUILDINGS_CLIENT.ERROR_LOGO_TYPE);
      return;
    }

    setError("");
    setRemoveLogo(false);
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const onRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setRemoveLogo(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = () => {
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("address", address.trim());
      formData.set("contactEmail", contactEmail.trim());
      formData.set("contactPhone", contactPhone.trim());
      formData.set("website", website.trim());
      formData.set("removeLogo", String(removeLogo));
      if (logoFile) formData.set("logo", logoFile);

      const result = await updateBuildingAction(building.id, formData);
      if (!result?.isSuccess) {
        setError(result?.message || BUILDINGS_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      setLogoFile(null);
      setRemoveLogo(false);
      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold tracking-tight">{BUILDINGS_CLIENT.FORM_TITLE}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{BUILDINGS_CLIENT.FORM_DESC}</p>

      {readOnly ? (
        <Alert className="mt-4 rounded-xl">
          <AlertDescription>{BUILDINGS_CLIENT.READ_ONLY_NOTICE}</AlertDescription>
        </Alert>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!readOnly) submit();
        }}
        className="mt-6"
      >
        <FieldGroup>
          <Field>
            <FieldLabel>{BUILDINGS_CLIENT.FIELD_LOGO_LABEL}</FieldLabel>
            <div className="flex items-center gap-4">
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
                {logoPreviewUrl ? (
                  <Image alt={name} src={logoPreviewUrl} fill sizes="64px" className="object-cover" />
                ) : (
                  <Building2Icon className="size-6 text-muted-foreground" />
                )}
              </div>
              {!readOnly ? (
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onSelectLogo}
                    disabled={isPending}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPending}
                    >
                      <UploadIcon />
                      {logoPreviewUrl ? BUILDINGS_CLIENT.REPLACE_LOGO : BUILDINGS_CLIENT.UPLOAD_LOGO}
                    </Button>
                    {logoPreviewUrl ? (
                      <Button type="button" variant="ghost" size="sm" onClick={onRemoveLogo} disabled={isPending}>
                        {BUILDINGS_CLIENT.REMOVE_LOGO}
                      </Button>
                    ) : null}
                  </div>
                  <FieldDescription>{BUILDINGS_CLIENT.FIELD_LOGO_DESC}</FieldDescription>
                </div>
              ) : null}
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="building-name">{BUILDINGS_CLIENT.FIELD_NAME_LABEL}</FieldLabel>
            <Input
              id="building-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending || readOnly}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="building-address">{BUILDINGS_CLIENT.FIELD_ADDRESS_LABEL}</FieldLabel>
            <Input
              id="building-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              disabled={isPending || readOnly}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="building-contact-email">{BUILDINGS_CLIENT.FIELD_CONTACT_EMAIL_LABEL}</FieldLabel>
            <Input
              id="building-contact-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              disabled={isPending || readOnly}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="building-contact-phone">{BUILDINGS_CLIENT.FIELD_CONTACT_PHONE_LABEL}</FieldLabel>
            <Input
              id="building-contact-phone"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              disabled={isPending || readOnly}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="building-website">{BUILDINGS_CLIENT.FIELD_WEBSITE_LABEL}</FieldLabel>
            <Input
              id="building-website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              disabled={isPending || readOnly}
            />
          </Field>

          {success ? <FormAlert successMessage={BUILDINGS_CLIENT.SUCCESS_UPDATED} /> : null}
          <FormAlert errorMessage={error} />

          {!readOnly ? (
            <Button type="submit" size="lg" disabled={isPending || name.trim().length < 2}>
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? BUILDINGS_CLIENT.SAVING : BUILDINGS_CLIENT.SAVE}
            </Button>
          ) : null}
        </FieldGroup>
      </form>
    </div>
  );
}
