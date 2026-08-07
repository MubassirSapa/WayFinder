"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { Building2Icon, Loader2Icon, PencilIcon, UploadIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MEDIA_RESOURCE_FOLDER } from "@/constants/media";
import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";
import { OrganizationInfoCard } from "@/features/dashboard/components/OrganizationInfoCard";
import { useStagedMediaUpload } from "@/hooks/use-staged-media-upload";

import { ORGANIZATION_SETTINGS_CLIENT } from "../constants/organization-settings.constants";
import { updateOrganizationAction } from "../actions/server/update-organization";
import type { OrganizationEditData, OrganizationType } from "../types/organization-settings.types";

type OrganizationFormProps = {
  organization: OrganizationEditData;
};

export function OrganizationForm({ organization }: OrganizationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logo = useStagedMediaUpload(organization.logoUrl, fileInputRef);

  const [name, setName] = useState(organization.name);
  const [type, setType] = useState(organization.type);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onSelectLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(ORGANIZATION_SETTINGS_CLIENT.ERROR_LOGO_TYPE);
      logo.rejectInvalidFile();
      return;
    }

    setError("");
    logo.select(file);
  };

  const submit = () => {
    setError("");
    setSuccess(false);

    startTransition(async () => {
      let logoResolution;
      try {
        logoResolution = await logo.resolve({ data: { alt: `${name} logo` }, docPrefix: MEDIA_RESOURCE_FOLDER.ORGANIZATIONS });
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : ORGANIZATION_SETTINGS_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("type", type);
      if (logoResolution) {
        formData.set("removeLogo", String(logoResolution.id === null));
        if (logoResolution.id) formData.set("logoId", logoResolution.id);
      }

      const result = await updateOrganizationAction(formData);
      if (!result?.isSuccess) {
        setError(result?.message || ORGANIZATION_SETTINGS_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      logo.settle(result.data.logoUrl);
      setSuccess(true);
      setIsEditing(false);
      router.refresh();
    });
  };

  const cancelEditing = () => {
    setName(organization.name);
    setType(organization.type);
    logo.reset(organization.logoUrl);
    setError("");
    setSuccess(false);
    setIsEditing(false);
  };

  const typeLabel = ORGANIZATION_TYPES.find((option) => option.value === type)?.label ?? type;

  if (!isEditing) {
    return (
      <OrganizationInfoCard
        name={name}
        typeLabel={typeLabel}
        logoUrl={logo.previewUrl}
        action={
          <Button type="button" variant="outline" className="h-11 px-4" onClick={() => setIsEditing(true)}>
            <PencilIcon />
            {ORGANIZATION_SETTINGS_CLIENT.EDIT}
          </Button>
        }
      />
    );
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
      <h2 className="font-heading text-lg font-semibold tracking-tight">{ORGANIZATION_SETTINGS_CLIENT.FORM_TITLE}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{ORGANIZATION_SETTINGS_CLIENT.FORM_DESC}</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="mt-6"
      >
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel>{ORGANIZATION_SETTINGS_CLIENT.FIELD_LOGO_LABEL}</FieldLabel>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                {logo.previewUrl ? (
                  <Image alt={name} src={logo.previewUrl} fill sizes="64px" className="object-cover" unoptimized />
                ) : (
                  <Building2Icon className="size-6 text-muted-foreground" />
                )}
              </div>
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
                    {logo.previewUrl ? ORGANIZATION_SETTINGS_CLIENT.REPLACE_LOGO : ORGANIZATION_SETTINGS_CLIENT.UPLOAD_LOGO}
                  </Button>
                  {logo.previewUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={logo.remove}
                      disabled={isPending}
                    >
                      {ORGANIZATION_SETTINGS_CLIENT.REMOVE_LOGO}
                    </Button>
                  ) : null}
                </div>
                <FieldDescription>{ORGANIZATION_SETTINGS_CLIENT.FIELD_LOGO_DESC}</FieldDescription>
              </div>
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="organization-name">{ORGANIZATION_SETTINGS_CLIENT.FIELD_NAME_LABEL}</FieldLabel>
            <Input
              id="organization-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={ORGANIZATION_SETTINGS_CLIENT.FIELD_NAME_PLACEHOLDER}
              disabled={isPending}
              className="h-11"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="organization-type">{ORGANIZATION_SETTINGS_CLIENT.FIELD_TYPE_LABEL}</FieldLabel>
            <Select value={type} onValueChange={(value) => setType((value as OrganizationType) ?? type)}>
              <SelectTrigger id="organization-type" className="h-11 w-full">
                <SelectValue>
                  {() => ORGANIZATION_TYPES.find((option) => option.value === type)?.label ?? type}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ORGANIZATION_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {success ? (
            <div className="sm:col-span-2">
              <FormAlert successMessage={ORGANIZATION_SETTINGS_CLIENT.SUCCESS_UPDATED} />
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <FormAlert errorMessage={error} />
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-border pt-5 sm:col-span-2 sm:flex sm:justify-end [&_button]:h-11 [&_button]:px-5">
            <Button type="button" variant="outline" onClick={cancelEditing} disabled={isPending}>
              {ORGANIZATION_SETTINGS_CLIENT.CANCEL}
            </Button>
            <Button type="submit" disabled={isPending || name.trim().length < 2}>
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? ORGANIZATION_SETTINGS_CLIENT.SAVING : ORGANIZATION_SETTINGS_CLIENT.SAVE}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}
