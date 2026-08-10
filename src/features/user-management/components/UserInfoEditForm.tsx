"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, UploadIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MEDIA_MAX_FILE_SIZE_BYTES, MEDIA_RESOURCE_FOLDER } from "@/constants/media";
import { useStagedMediaUpload } from "@/hooks/use-staged-media-upload";

import { updateOrgUserInfoAction } from "../actions/server/update-org-user";
import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import { userInitials } from "../lib/user-management-presentation";
import type { OrgUserDetail } from "../types/user-management.types";

type UserInfoEditFormProps = {
  user: OrgUserDetail;
  onCancel: () => void;
  onSaved: () => void;
};

// Mirrors BuildingForm.tsx's edit-mode shape (a bordered card, FieldGroup,
// border-t footer) rather than ProfileForm's more elaborate multi-component
// structure - UserDetailPanel already has its own summary component
// (UserSummaryCard) and orchestrates several sibling sections itself, so
// this only needs to be the form, not a second identity header too.
export function UserInfoEditForm({ user, onCancel, onSaved }: UserInfoEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const avatar = useStagedMediaUpload(user.avatarUrl, fileInputRef);

  const [name, setName] = useState(user.name);
  const [error, setError] = useState("");

  const onSelectAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(USER_MANAGEMENT_CLIENT.ERROR_AVATAR_TYPE);
      avatar.rejectInvalidFile();
      return;
    }

    if (file.size > MEDIA_MAX_FILE_SIZE_BYTES) {
      setError(USER_MANAGEMENT_CLIENT.ERROR_AVATAR_SIZE);
      avatar.rejectInvalidFile();
      return;
    }

    setError("");
    avatar.select(file);
  };

  const submit = () => {
    setError("");

    startTransition(async () => {
      let avatarResolution;
      try {
        avatarResolution = await avatar.resolve({
          data: { alt: `${name} avatar` },
          docPrefix: MEDIA_RESOURCE_FOLDER.USERS,
        });
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      const formData = new FormData();
      formData.set("name", name.trim());
      if (avatarResolution) {
        formData.set("removeAvatar", String(avatarResolution.id === null));
        if (avatarResolution.id) formData.set("avatarId", avatarResolution.id);
      }

      const result = await updateOrgUserInfoAction(user.id, formData);
      if (!result?.isSuccess) {
        setError(result?.message || USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);
        return;
      }

      router.refresh();
      onSaved();
    });
  };

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
      <h2 className="font-heading text-lg font-semibold tracking-tight">{USER_MANAGEMENT_CLIENT.EDIT_INFO_TITLE}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{USER_MANAGEMENT_CLIENT.EDIT_INFO_DESCRIPTION}</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="mt-6"
      >
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel>{USER_MANAGEMENT_CLIENT.FIELD_AVATAR_LABEL}</FieldLabel>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
                {avatar.previewUrl ? (
                  <Image alt={name} src={avatar.previewUrl} fill sizes="64px" className="object-cover" unoptimized />
                ) : (
                  <span className="text-lg font-medium text-muted-foreground">{userInitials(name)}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onSelectAvatar}
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
                    {avatar.previewUrl ? USER_MANAGEMENT_CLIENT.REPLACE_PHOTO : USER_MANAGEMENT_CLIENT.UPLOAD_PHOTO}
                  </Button>
                  {avatar.previewUrl ? (
                    <Button type="button" variant="ghost" size="sm" onClick={avatar.remove} disabled={isPending}>
                      {USER_MANAGEMENT_CLIENT.REMOVE_PHOTO}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="user-info-name">{USER_MANAGEMENT_CLIENT.FIELD_NAME_LABEL}</FieldLabel>
            <Input
              id="user-info-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
              className="h-11"
            />
          </Field>

          <div className="sm:col-span-2">
            <FormAlert errorMessage={error} />
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-border pt-5 sm:col-span-2 sm:flex sm:justify-end [&_button]:h-11 [&_button]:px-5">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              {USER_MANAGEMENT_CLIENT.CANCEL}
            </Button>
            <Button type="submit" disabled={isPending || name.trim().length < 2}>
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? USER_MANAGEMENT_CLIENT.SAVING : USER_MANAGEMENT_CLIENT.SAVE}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}
