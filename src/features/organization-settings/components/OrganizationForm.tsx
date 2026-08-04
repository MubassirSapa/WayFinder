"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { ArrowLeftIcon, Building2Icon, Loader2Icon, UploadIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";

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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(organization.logoUrl);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSelectLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(ORGANIZATION_SETTINGS_CLIENT.ERROR_LOGO_TYPE);
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
      formData.set("type", type);
      formData.set("removeLogo", String(removeLogo));
      if (logoFile) formData.set("logo", logoFile);

      const result = await updateOrganizationAction(formData);
      if (!result?.isSuccess) {
        setError(result?.message || ORGANIZATION_SETTINGS_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      setLogoFile(null);
      setRemoveLogo(false);
      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <Card className="mx-auto w-full max-w-xl p-6 sm:p-8">
      <Link
        href={PRIVATE_ROUTES.DASHBOARD}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        {ORGANIZATION_SETTINGS_CLIENT.BACK_TO_DASHBOARD}
      </Link>

      <h1 className="font-heading text-xl font-semibold tracking-tight">{ORGANIZATION_SETTINGS_CLIENT.FORM_TITLE}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{ORGANIZATION_SETTINGS_CLIENT.FORM_DESC}</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="mt-6"
      >
        <FieldGroup>
          <Field>
            <FieldLabel>{ORGANIZATION_SETTINGS_CLIENT.FIELD_LOGO_LABEL}</FieldLabel>
            <div className="flex items-center gap-4">
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
                {logoPreviewUrl ? (
                  <Image alt={name} src={logoPreviewUrl} fill sizes="64px" className="object-cover" />
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
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                  >
                    <UploadIcon />
                    {logoPreviewUrl ? ORGANIZATION_SETTINGS_CLIENT.REPLACE_LOGO : ORGANIZATION_SETTINGS_CLIENT.UPLOAD_LOGO}
                  </Button>
                  {logoPreviewUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onRemoveLogo}
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

          {success ? <FormAlert successMessage={ORGANIZATION_SETTINGS_CLIENT.SUCCESS_UPDATED} /> : null}
          <FormAlert errorMessage={error} />

          <Button type="submit" size="lg" disabled={isPending || name.trim().length < 2}>
            {isPending ? <Loader2Icon className="animate-spin" /> : null}
            {isPending ? ORGANIZATION_SETTINGS_CLIENT.SAVING : ORGANIZATION_SETTINGS_CLIENT.SAVE}
          </Button>
        </FieldGroup>
      </form>
    </Card>
  );
}
