"use client";

import { useState, useTransition } from "react";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";

import { updateOrganizationProfileAction } from "../actions/server/update-organization-profile";
import { PROFILE_CLIENT } from "../constants/profile.constants";
import type { OrganizationProfile, OrganizationType } from "../types/profile.types";
import { UpdateOrganizationProfileSchema } from "../validations/update-organization-profile";
import { ProfileSection } from "./ProfileSection";

type ProfileFormValues = {
  name: string;
  type: OrganizationType;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

type FieldErrors = Partial<Record<keyof ProfileFormValues, string>>;

function profileValues(organization: OrganizationProfile): ProfileFormValues {
  return {
    name: organization.name,
    type: organization.type,
    email: organization.contact.email,
    phone: organization.contact.phone,
    website: organization.contact.website,
    addressLine1: organization.address.line1,
    addressLine2: organization.address.line2,
    city: organization.address.city,
    region: organization.address.region,
    postalCode: organization.address.postalCode,
    country: organization.address.country,
  };
}

export function ProfileForm({ organization }: { organization: OrganizationProfile }) {
  const router = useRouter();
  const [values, setValues] = useState(() => profileValues(organization));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateField<Key extends keyof ProfileFormValues>(
    field: Key,
    value: ProfileFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage("");
    setSaved(false);
  }

  function submit() {
    setErrors({});
    setMessage("");
    setSaved(false);

    const validation = UpdateOrganizationProfileSchema.safeParse(values);
    if (!validation.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof ProfileFormValues | undefined;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      }
      setErrors(nextErrors);
      setMessage(validation.error.issues[0]?.message ?? PROFILE_CLIENT.ERROR_UPDATE_FAILED);
      return;
    }

    startTransition(async () => {
      const result = await updateOrganizationProfileAction(values);
      if (!result.isSuccess) {
        setMessage(result.message || PROFILE_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      setValues((current) => ({
        ...current,
        website: validation.data.website ?? "",
      }));
      setSaved(true);
      setMessage(result.message || PROFILE_CLIENT.SAVED);
      router.refresh();
    });
  }

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <ProfileSection
        title={PROFILE_CLIENT.BASICS_TITLE}
        description={PROFILE_CLIENT.BASICS_DESCRIPTION}
      >
        <Field>
          <FieldLabel htmlFor="organization-name">{PROFILE_CLIENT.NAME_LABEL}</FieldLabel>
          <Input
            id="organization-name"
            name="name"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            autoComplete="organization"
            className="h-11 px-3 text-base md:text-sm"
            disabled={isPending}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "organization-name-error" : undefined}
          />
          <FieldError id="organization-name-error">{errors.name}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="organization-type">{PROFILE_CLIENT.TYPE_LABEL}</FieldLabel>
          <Select
            value={values.type}
            onValueChange={(value) => {
              if (value) updateField("type", String(value) as OrganizationType);
            }}
            disabled={isPending}
          >
            <SelectTrigger
              id="organization-type"
              className="h-11 w-full px-3 text-sm"
              aria-invalid={Boolean(errors.type)}
              aria-describedby={errors.type ? "organization-type-error" : undefined}
            >
              <SelectValue>
                {(value: string | null) =>
                  ORGANIZATION_TYPES.find((option) => option.value === value)?.label ??
                  PROFILE_CLIENT.TYPE_LABEL
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ORGANIZATION_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value} className="min-h-11">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="organization-type-error">{errors.type}</FieldError>
        </Field>
      </ProfileSection>

      <ProfileSection
        title={PROFILE_CLIENT.CONTACT_TITLE}
        description={PROFILE_CLIENT.CONTACT_DESCRIPTION}
      >
        <ProfileInput
          id="contact-email"
          label={PROFILE_CLIENT.EMAIL_LABEL}
          type="email"
          value={values.email}
          placeholder={PROFILE_CLIENT.EMAIL_PLACEHOLDER}
          autoComplete="email"
          error={errors.email}
          disabled={isPending}
          onChange={(value) => updateField("email", value)}
        />
        <ProfileInput
          id="contact-phone"
          label={PROFILE_CLIENT.PHONE_LABEL}
          type="tel"
          value={values.phone}
          placeholder={PROFILE_CLIENT.PHONE_PLACEHOLDER}
          autoComplete="tel"
          inputMode="tel"
          error={errors.phone}
          disabled={isPending}
          onChange={(value) => updateField("phone", value)}
        />
        <ProfileInput
          id="contact-website"
          label={PROFILE_CLIENT.WEBSITE_LABEL}
          type="url"
          value={values.website}
          placeholder={PROFILE_CLIENT.WEBSITE_PLACEHOLDER}
          autoComplete="url"
          inputMode="url"
          error={errors.website}
          disabled={isPending}
          onChange={(value) => updateField("website", value)}
        />
      </ProfileSection>

      <ProfileSection
        title={PROFILE_CLIENT.ADDRESS_TITLE}
        description={PROFILE_CLIENT.ADDRESS_DESCRIPTION}
      >
        <ProfileInput
          id="address-line-1"
          label={PROFILE_CLIENT.ADDRESS_LINE_1_LABEL}
          value={values.addressLine1}
          autoComplete="address-line1"
          error={errors.addressLine1}
          disabled={isPending}
          onChange={(value) => updateField("addressLine1", value)}
        />
        <ProfileInput
          id="address-line-2"
          label={PROFILE_CLIENT.ADDRESS_LINE_2_LABEL}
          value={values.addressLine2}
          autoComplete="address-line2"
          error={errors.addressLine2}
          disabled={isPending}
          onChange={(value) => updateField("addressLine2", value)}
        />
        <ProfileInput
          id="address-city"
          label={PROFILE_CLIENT.CITY_LABEL}
          value={values.city}
          autoComplete="address-level2"
          error={errors.city}
          disabled={isPending}
          onChange={(value) => updateField("city", value)}
        />
        <ProfileInput
          id="address-region"
          label={PROFILE_CLIENT.REGION_LABEL}
          value={values.region}
          autoComplete="address-level1"
          error={errors.region}
          disabled={isPending}
          onChange={(value) => updateField("region", value)}
        />
        <ProfileInput
          id="address-postal-code"
          label={PROFILE_CLIENT.POSTAL_CODE_LABEL}
          value={values.postalCode}
          autoComplete="postal-code"
          error={errors.postalCode}
          disabled={isPending}
          onChange={(value) => updateField("postalCode", value)}
        />
        <ProfileInput
          id="address-country"
          label={PROFILE_CLIENT.COUNTRY_LABEL}
          value={values.country}
          autoComplete="country-name"
          error={errors.country}
          disabled={isPending}
          onChange={(value) => updateField("country", value)}
        />
      </ProfileSection>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-xl sm:border">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={saved ? "flex items-center gap-2 text-sm text-primary" : "text-sm text-destructive"}
            role={message ? "status" : undefined}
            aria-live="polite"
          >
            {saved ? <CheckCircle2Icon className="size-4 shrink-0" aria-hidden /> : null}
            {message}
          </p>
          <Button type="submit" size="lg" className="h-11 w-full px-5 text-sm sm:w-auto" disabled={isPending}>
            {isPending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
            {isPending ? PROFILE_CLIENT.SAVING : PROFILE_CLIENT.SAVE}
          </Button>
        </div>
      </div>
    </form>
  );
}

type ProfileInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "url";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "tel" | "url";
  error?: string;
  disabled?: boolean;
};

function ProfileInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  error,
  disabled,
}: ProfileInputProps) {
  const errorId = `${id}-error`;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="h-11 px-3 text-base md:text-sm"
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
