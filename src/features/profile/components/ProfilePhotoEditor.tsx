import type { ChangeEventHandler, RefObject } from "react";
import { Trash2Icon, UploadIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { PROFILE_CLIENT } from "../constants/profile.constants";

type ProfilePhotoEditorProps = {
  avatarUrl: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  initial: string;
  isPending: boolean;
  name: string;
  onRemove: () => void;
  onSelect: ChangeEventHandler<HTMLInputElement>;
  onUpload: () => void;
};

export function ProfilePhotoEditor({
  avatarUrl,
  fileInputRef,
  initial,
  isPending,
  name,
  onRemove,
  onSelect,
  onUpload,
}: ProfilePhotoEditorProps) {
  return (
    <section aria-labelledby="profile-photo-label" className="lg:border-e lg:border-border lg:pe-6">
      <p
        id="profile-photo-label"
        className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
      >
        {PROFILE_CLIENT.FIELD_AVATAR_LABEL}
      </p>

      <div className="mt-3 flex items-center gap-3 lg:flex-col lg:items-start">
        <Avatar className="size-16 border border-border shadow-sm">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback className="bg-muted text-xl font-semibold text-foreground">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2 lg:w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={onSelect}
            disabled={isPending}
          />
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full sm:h-8 sm:w-auto lg:w-full"
            onClick={onUpload}
            disabled={isPending}
          >
            <UploadIcon />
            {avatarUrl ? PROFILE_CLIENT.REPLACE_AVATAR : PROFILE_CLIENT.UPLOAD_AVATAR}
          </Button>
          {avatarUrl ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full justify-start text-destructive hover:text-destructive sm:h-8 sm:w-auto lg:w-full"
              onClick={onRemove}
              disabled={isPending}
            >
              <Trash2Icon />
              {PROFILE_CLIENT.REMOVE_AVATAR}
            </Button>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-[0.6875rem] leading-4 text-muted-foreground">
        {PROFILE_CLIENT.FIELD_AVATAR_DESC}
      </p>
    </section>
  );
}
