"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { Building2Icon, GlobeIcon, Loader2Icon, MailIcon, MapPinIcon, PencilIcon, PhoneIcon, UploadIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";
import { EntitySummaryCard } from "@/features/dashboard/components/EntitySummaryCard";
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
  const [isEditing, setIsEditing] = useState(false);

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
      setIsEditing(false);
      router.refresh();
    });
  };

  const cancelEditing = () => {
    setName(building.name);
    setAddress(building.address ?? "");
    setContactEmail(building.contactEmail ?? "");
    setContactPhone(building.contactPhone ?? "");
    setWebsite(building.website ?? "");
    setLogoFile(null);
    setLogoPreviewUrl(building.logoUrl);
    setRemoveLogo(false);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsEditing(false);
  };

  if (!isEditing) {
    const details = [
      { icon: MapPinIcon, label: BUILDINGS_CLIENT.FIELD_ADDRESS_LABEL, value: address },
      { icon: MailIcon, label: BUILDINGS_CLIENT.FIELD_CONTACT_EMAIL_LABEL, value: contactEmail },
      { icon: PhoneIcon, label: BUILDINGS_CLIENT.FIELD_CONTACT_PHONE_LABEL, value: contactPhone },
      { icon: GlobeIcon, label: BUILDINGS_CLIENT.FIELD_WEBSITE_LABEL, value: website },
    ];

    return (
      <EntitySummaryCard
        visual={<div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-primary/15">
            {logoPreviewUrl ? (
              <Image alt={name} src={logoPreviewUrl} fill sizes="80px" className="object-cover" />
            ) : (
              <Building2Icon className="size-8 text-primary" />
            )}
          </div>}
        title={name}
        meta={building.organizationName}
        action={building.canEdit ? (
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)} className="self-start sm:self-auto">
              <PencilIcon />
              {BUILDINGS_CLIENT.EDIT}
            </Button>
          ) : null}
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-0 gap-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 break-words text-sm">{value || BUILDINGS_CLIENT.INFO_NOT_SET}</dd>
              </div>
            </div>
          ))}
        </dl>
      </EntitySummaryCard>
    );
  }

  return (
    <section className="border-y border-border py-5 sm:py-6">
      <h2 className="font-heading text-lg font-semibold tracking-tight">{BUILDINGS_CLIENT.FORM_TITLE}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{BUILDINGS_CLIENT.FORM_DESC}</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!readOnly) submit();
        }}
        className="mt-6"
      >
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel>{BUILDINGS_CLIENT.FIELD_LOGO_LABEL}</FieldLabel>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
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
                  <div className="flex flex-wrap gap-2">
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

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="building-name">{BUILDINGS_CLIENT.FIELD_NAME_LABEL}</FieldLabel>
            <Input
              id="building-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending || readOnly}
            />
          </Field>

          <Field className="sm:col-span-2">
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

          {success ? (
            <div className="sm:col-span-2">
              <FormAlert successMessage={BUILDINGS_CLIENT.SUCCESS_UPDATED} />
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <FormAlert errorMessage={error} />
          </div>

          {!readOnly ? (
            <div className="grid grid-cols-2 gap-2 border-t border-border pt-5 sm:col-span-2 sm:flex sm:justify-end">
              <Button type="button" variant="outline" onClick={cancelEditing} disabled={isPending}>
                {BUILDINGS_CLIENT.CANCEL}
              </Button>
              <Button type="submit" disabled={isPending || name.trim().length < 2}>
                {isPending ? <Loader2Icon className="animate-spin" /> : null}
                {isPending ? BUILDINGS_CLIENT.SAVING : BUILDINGS_CLIENT.SAVE}
              </Button>
            </div>
          ) : null}
        </FieldGroup>
      </form>
    </section>
  );
}
