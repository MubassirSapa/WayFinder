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
    <section aria-labelledby="profile-photo-label" className="md:border-e md:border-border md:pe-8">
      <p id="profile-photo-label" className="text-sm font-medium">
        {PROFILE_CLIENT.FIELD_AVATAR_LABEL}
      </p>

      <div className="mt-3 flex items-center gap-4 md:flex-col md:items-start">
        <Avatar className="size-20 border-2 border-border shadow-sm">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback className="bg-muted text-xl font-semibold text-foreground">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2 md:w-full">
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
            className="h-10 w-full sm:w-auto md:w-full"
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
              className="h-9 w-full justify-start text-destructive hover:text-destructive sm:w-auto md:w-full"
              onClick={onRemove}
              disabled={isPending}
            >
              <Trash2Icon />
              {PROFILE_CLIENT.REMOVE_AVATAR}
            </Button>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {PROFILE_CLIENT.FIELD_AVATAR_DESC}
      </p>
    </section>
  );
}
