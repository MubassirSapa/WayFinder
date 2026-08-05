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
import { uploadMediaClientSide } from "@/lib/uploads/uploadMediaClientSide";

import { ORGANIZATION_SETTINGS_CLIENT } from "../constants/organization-settings.constants";
import { updateOrganizationAction } from "../actions/server/update-organization";
import type { OrganizationEditData, OrganizationType } from "../types/organization-settings.types";

type OrganizationFormProps = {
  organization: OrganizationEditData;
};

export function OrganizationForm({ organization }: OrganizationFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(organization.name);
  const [type, setType] = useState(organization.type);
  const [logoId, setLogoId] = useState<string | null>(organization.logoId);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(organization.logoUrl);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onSelectLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(ORGANIZATION_SETTINGS_CLIENT.ERROR_LOGO_TYPE);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError("");
    setIsUploadingLogo(true);
    try {
      const media = await uploadMediaClientSide({
        data: { alt: `${name} logo` },
        docPrefix: MEDIA_RESOURCE_FOLDER.ORGANIZATIONS,
        file,
      });
      setRemoveLogo(false);
      setLogoId(String(media.id));
      setLogoPreviewUrl(media.url ?? null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : ORGANIZATION_SETTINGS_CLIENT.ERROR_UPDATE_FAILED);
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onRemoveLogo = () => {
    setLogoId(null);
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
      formData.set("type", type);
      formData.set("removeLogo", String(removeLogo));
      if (logoId) formData.set("logoId", logoId);

      const result = await updateOrganizationAction(formData);
      if (!result?.isSuccess) {
        setError(result?.message || ORGANIZATION_SETTINGS_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      setRemoveLogo(false);
      setSuccess(true);
      setIsEditing(false);
      router.refresh();
    });
  };

  const cancelEditing = () => {
    setName(organization.name);
    setType(organization.type);
    setLogoId(organization.logoId);
    setLogoPreviewUrl(organization.logoUrl);
    setRemoveLogo(false);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsEditing(false);
  };

  const typeLabel = ORGANIZATION_TYPES.find((option) => option.value === type)?.label ?? type;

  if (!isEditing) {
    return (
      <OrganizationInfoCard
        name={name}
        typeLabel={typeLabel}
        logoUrl={logoPreviewUrl}
        action={
          <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
            <PencilIcon />
            {ORGANIZATION_SETTINGS_CLIENT.EDIT}
          </Button>
        }
      />
    );
  }

  return (
    <section className="border-y border-border py-5 sm:py-6">
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
                {logoPreviewUrl ? (
                  <Image alt={name} src={logoPreviewUrl} fill sizes="64px" className="object-cover" unoptimized />
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
                  disabled={isPending || isUploadingLogo}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending || isUploadingLogo}
                  >
                    {isUploadingLogo ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
                    {isUploadingLogo
                      ? ORGANIZATION_SETTINGS_CLIENT.UPLOADING_LOGO
                      : logoPreviewUrl
                        ? ORGANIZATION_SETTINGS_CLIENT.REPLACE_LOGO
                        : ORGANIZATION_SETTINGS_CLIENT.UPLOAD_LOGO}
                  </Button>
                  {logoPreviewUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onRemoveLogo}
                      disabled={isPending || isUploadingLogo}
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
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="organization-type">{ORGANIZATION_SETTINGS_CLIENT.FIELD_TYPE_LABEL}</FieldLabel>
            <Select value={type} onValueChange={(value) => setType((value as OrganizationType) ?? type)}>
              <SelectTrigger id="organization-type" className="w-full">
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

          <div className="grid grid-cols-2 gap-2 border-t border-border pt-5 sm:col-span-2 sm:flex sm:justify-end">
            <Button type="button" variant="outline" onClick={cancelEditing} disabled={isPending}>
              {ORGANIZATION_SETTINGS_CLIENT.CANCEL}
            </Button>
            <Button type="submit" disabled={isPending || isUploadingLogo || name.trim().length < 2}>
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? ORGANIZATION_SETTINGS_CLIENT.SAVING : ORGANIZATION_SETTINGS_CLIENT.SAVE}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}
