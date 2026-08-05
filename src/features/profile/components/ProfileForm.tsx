"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MEDIA_RESOURCE_FOLDER } from "@/constants/media";
import { useStagedMediaUpload } from "@/hooks/use-staged-media-upload";

import { updateProfileAction } from "../actions/server/update-profile";
import { PROFILE_CLIENT } from "../constants/profile.constants";
import { profileInitial, profileRoleLabel } from "../lib/profile-presentation";
import type { ProfileEditData } from "../types/profile.types";
import { ProfileAccountSummary } from "./ProfileAccountSummary";
import { ProfileDetailsView } from "./ProfileDetailsView";
import { ProfileIdentityHeader } from "./ProfileIdentityHeader";
import { ProfilePhotoEditor } from "./ProfilePhotoEditor";

type ProfileFormProps = {
  profile: ProfileEditData;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const avatar = useStagedMediaUpload(profile.avatarUrl, fileInputRef);

  const [name, setName] = useState(profile.name);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initial = profileInitial(name, profile.email);
  const roleLabel = profileRoleLabel(profile.role);

  const onSelectAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(PROFILE_CLIENT.ERROR_AVATAR_TYPE);
      avatar.rejectInvalidFile();
      return;
    }

    setError("");
    avatar.select(file);
  };

  const cancelEditing = () => {
    setName(profile.name);
    avatar.reset(profile.avatarUrl);
    setError("");
    setSuccess(false);
    setIsEditing(false);
  };

  const submit = () => {
    setError("");
    setSuccess(false);

    startTransition(async () => {
      let avatarResolution;
      try {
        avatarResolution = await avatar.resolve({ data: { alt: `${name} avatar` }, docPrefix: MEDIA_RESOURCE_FOLDER.USERS });
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : PROFILE_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      const formData = new FormData();
      formData.set("name", name.trim());
      if (avatarResolution) {
        formData.set("removeAvatar", String(avatarResolution.id === null));
        if (avatarResolution.id) formData.set("avatarId", avatarResolution.id);
      }

      const result = await updateProfileAction(formData);
      if (!result?.isSuccess) {
        setError(result?.message || PROFILE_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      setName(result.data.name);
      avatar.settle(result.data.avatarUrl);
      setSuccess(true);
      setIsEditing(false);
      router.refresh();
    });
  };

  return (
    <Card className="mx-auto w-full max-w-3xl gap-0 overflow-hidden py-0">
      <ProfileIdentityHeader
        avatarUrl={avatar.previewUrl}
        email={profile.email}
        initial={initial}
        name={name}
        roleLabel={roleLabel}
      />

      {!isEditing ? (
        <>
          {success ? (
            <div className="px-5 pb-1 sm:px-8">
              <FormAlert successMessage={PROFILE_CLIENT.SUCCESS_UPDATED} />
            </div>
          ) : null}
          <ProfileDetailsView profile={{ ...profile, name }} roleLabel={roleLabel} onEdit={() => setIsEditing(true)} />
        </>
      ) : (
        <section className="border-t border-border">
          <header className="px-5 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
            <h3 className="font-heading text-lg font-semibold">{PROFILE_CLIENT.EDIT_TITLE}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{PROFILE_CLIENT.EDIT_DESCRIPTION}</p>
          </header>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            className="border-t border-border"
          >
            <div className="grid gap-7 px-5 py-6 sm:px-8 sm:py-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8">
              <ProfilePhotoEditor
                avatarUrl={avatar.previewUrl}
                fileInputRef={fileInputRef}
                initial={initial}
                isPending={isPending}
                name={name}
                onRemove={avatar.remove}
                onSelect={onSelectAvatar}
                onUpload={() => fileInputRef.current?.click()}
              />

              <div className="min-w-0 space-y-6">
                <Field>
                  <FieldLabel htmlFor="profile-name">{PROFILE_CLIENT.FIELD_NAME_LABEL}</FieldLabel>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isPending}
                    autoComplete="name"
                    className="h-11"
                  />
                </Field>

                <ProfileAccountSummary email={profile.email} roleLabel={roleLabel} />
                <FormAlert errorMessage={error} />
              </div>
            </div>

            <footer className="grid grid-cols-2 gap-3 border-t border-border px-5 py-4 sm:flex sm:justify-end sm:px-8">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-4"
                onClick={cancelEditing}
                disabled={isPending}
              >
                {PROFILE_CLIENT.CANCEL}
              </Button>
              <Button
                type="submit"
                className="h-10 px-4"
                disabled={isPending || name.trim().length < 2}
              >
                {isPending ? <Loader2Icon className="animate-spin" /> : null}
                {isPending ? PROFILE_CLIENT.SAVING : PROFILE_CLIENT.SAVE}
              </Button>
            </footer>
          </form>
        </section>
      )}
    </Card>
  );
}
