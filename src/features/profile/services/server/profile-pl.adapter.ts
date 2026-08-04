import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import type { User } from "@/payload-types";

import { MAX_AVATAR_SIZE_BYTES, PROFILE_CLIENT } from "../../constants/profile.constants";
import type { ProfileEditData, TUpdateProfileInput } from "../../types/profile.types";

async function getPayloadClient() {
  return getPayload({ config });
}

function toProfileEditData(target: User): ProfileEditData {
  const avatar = typeof target.avatar === "object" && target.avatar ? target.avatar : null;

  return {
    id: String(target.id),
    name: target.name,
    email: target.email,
    role: target.role,
    avatarUrl: avatar?.url ?? null,
  };
}

export async function getProfileForEditAdapter(user: User) {
  return tryCatchResponse<ProfileEditData>(async () => {
    const payload = await getPayloadClient();

    const target = await payload.findByID({
      collection: "users",
      id: user.id,
      depth: 1,
      user,
      overrideAccess: false,
    });

    return toProfileEditData(target);
  });
}

export async function updateProfileAdapter(user: User, input: TUpdateProfileInput) {
  return tryCatchResponse<ProfileEditData>(async () => {
    const payload = await getPayloadClient();

    const data: { name: string; avatar?: number | null } = { name: input.name };

    if (input.avatarFile) {
      if (!input.avatarFile.type.startsWith("image/")) throw new Error(PROFILE_CLIENT.ERROR_AVATAR_TYPE);
      if (input.avatarFile.size > MAX_AVATAR_SIZE_BYTES) throw new Error(PROFILE_CLIENT.ERROR_AVATAR_SIZE);

      const buffer = Buffer.from(await input.avatarFile.arrayBuffer());
      const media = await payload.create({
        collection: "media",
        data: { alt: `${input.name} avatar` },
        file: {
          data: buffer,
          mimetype: input.avatarFile.type,
          name: input.avatarFile.name,
          size: input.avatarFile.size,
        },
        user,
        overrideAccess: false,
      });
      data.avatar = media.id;
    } else if (input.removeAvatar) {
      data.avatar = null;
    }

    const target = await payload.update({
      collection: "users",
      id: user.id,
      depth: 1,
      user,
      overrideAccess: false,
      data,
    });

    return toProfileEditData(target);
  });
}
