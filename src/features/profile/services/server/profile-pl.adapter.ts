import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";
import { asPayloadId, relationId } from "@/lib/payload-id";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import type { User } from "@/payload-types";

import type { ProfileEditData, TUpdateProfileInput } from "../../types/profile.types";

async function getPayloadClient() {
  return getPayload({ config });
}

function toProfileEditData(target: {
  id: number | string;
  name: string;
  email: string;
  role: User["role"];
  avatar?: number | { id: number | string } | null;
  avatarUrl?: string | null;
}): ProfileEditData {
  const avatarId = relationId(target.avatar);

  return {
    id: String(target.id),
    name: target.name,
    email: target.email,
    role: target.role,
    avatarId: avatarId === null ? null : String(avatarId),
    avatarUrl: target.avatarUrl ?? null,
  };
}

export async function getProfileForEditAdapter(user: User) {
  return tryCatchResponse<ProfileEditData>(async () => {
    const payload = await getPayloadClient();

    // depth: 0 is enough — avatarUrl is a plain field (denormalized by
    // createSyncMediaUrlHook), so no populate hop into `media` is needed.
    // select trims the doc to only what toProfileEditData reads.
    const target = await payload.findByID({
      collection: "users",
      id: user.id,
      depth: 0,
      select: { name: true, email: true, role: true, avatar: true, avatarUrl: true },
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

    if (input.avatarId) {
      data.avatar = asPayloadId(input.avatarId);
    } else if (input.removeAvatar) {
      data.avatar = null;
    }

    const target = await payload.update({
      collection: "users",
      id: user.id,
      depth: 0,
      select: { name: true, email: true, role: true, avatar: true, avatarUrl: true },
      user,
      overrideAccess: false,
      data,
    });

    return toProfileEditData(target);
  });
}
