"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon, UploadIcon, UserIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EntitySummaryCard } from "@/features/dashboard/components/EntitySummaryCard";

import { PROFILE_CLIENT } from "../constants/profile.constants";
import { updateProfileAction } from "../actions/server/update-profile";
import type { ProfileEditData } from "../types/profile.types";

const ROLE_LABELS: Record<ProfileEditData["role"], string> = {
  owner: "Owner",
  manager: "Manager",
  member: "Member",
};

type ProfileFormProps = {
  profile: ProfileEditData;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(profile.name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(profile.avatarUrl);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initial = (name.trim()[0] ?? profile.email.trim()[0] ?? "A").toUpperCase();

  const onSelectAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(PROFILE_CLIENT.ERROR_AVATAR_TYPE);
      return;
    }

    setError("");
    setRemoveAvatar(false);
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  };

  const onRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = () => {
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("removeAvatar", String(removeAvatar));
      if (avatarFile) formData.set("avatar", avatarFile);

      const result = await updateProfileAction(formData);
      if (!result?.isSuccess) {
        setError(result?.message || PROFILE_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      setAvatarFile(null);
      setRemoveAvatar(false);
      setSuccess(true);
      setIsEditing(false);
      router.refresh();
    });
  };

  const cancelEditing = () => {
    setName(profile.name);
    setAvatarFile(null);
    setAvatarPreviewUrl(profile.avatarUrl);
    setRemoveAvatar(false);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <EntitySummaryCard
        visual={
          <Avatar className="size-28 sm:size-32">
            {avatarPreviewUrl ? <AvatarImage src={avatarPreviewUrl} alt={name} /> : null}
            <AvatarFallback className="text-3xl font-semibold">
              {avatarPreviewUrl ? initial : <UserIcon className="size-10" />}
            </AvatarFallback>
          </Avatar>
        }
        title={name}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <span>{profile.email}</span>
            <Badge variant="outline">{ROLE_LABELS[profile.role]}</Badge>
          </div>
        }
        action={
          <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
            <PencilIcon />
            {PROFILE_CLIENT.EDIT}
          </Button>
        }
      />
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="font-heading text-xl font-semibold tracking-tight">{PROFILE_CLIENT.FORM_TITLE}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{PROFILE_CLIENT.FORM_DESC}</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="mt-6"
      >
        <FieldGroup>
          <Field>
            <FieldLabel>{PROFILE_CLIENT.FIELD_AVATAR_LABEL}</FieldLabel>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {avatarPreviewUrl ? <AvatarImage src={avatarPreviewUrl} alt={name} /> : null}
                <AvatarFallback>
                  {avatarPreviewUrl ? initial : <UserIcon className="size-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onSelectAvatar}
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
                    {avatarPreviewUrl ? PROFILE_CLIENT.REPLACE_AVATAR : PROFILE_CLIENT.UPLOAD_AVATAR}
                  </Button>
                  {avatarPreviewUrl ? (
                    <Button type="button" variant="ghost" size="sm" onClick={onRemoveAvatar} disabled={isPending}>
                      {PROFILE_CLIENT.REMOVE_AVATAR}
                    </Button>
                  ) : null}
                </div>
                <FieldDescription>{PROFILE_CLIENT.FIELD_AVATAR_DESC}</FieldDescription>
              </div>
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-name">{PROFILE_CLIENT.FIELD_NAME_LABEL}</FieldLabel>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>{PROFILE_CLIENT.FIELD_EMAIL_LABEL}</FieldLabel>
              <Input value={profile.email} disabled readOnly />
            </Field>
            <Field>
              <FieldLabel>{PROFILE_CLIENT.FIELD_ROLE_LABEL}</FieldLabel>
              <div>
                <Badge variant="outline">{ROLE_LABELS[profile.role]}</Badge>
              </div>
            </Field>
          </div>

          {success ? <FormAlert successMessage={PROFILE_CLIENT.SUCCESS_UPDATED} /> : null}
          <FormAlert errorMessage={error} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelEditing} disabled={isPending}>
              {PROFILE_CLIENT.CANCEL}
            </Button>
            <Button type="submit" size="lg" disabled={isPending || name.trim().length < 2}>
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? PROFILE_CLIENT.SAVING : PROFILE_CLIENT.SAVE}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </Card>
  );
}
