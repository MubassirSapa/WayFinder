import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import config from "@payload-config";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { relationId } from "@/lib/payload-id";
import type { User } from "@/payload-types";

import type { TopbarUser } from "../../types/dashboard.types";

export async function getTopbarUser(): Promise<TopbarUser> {
  const headers = await getHeaders();
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers });
  if (!user) redirect(PUBLIC_ROUTES.SIGNIN);

  const currentUser = user as User;
  const name = currentUser.name ?? "";
  const email = currentUser.email ?? "";
  const initial = (name.trim()[0] ?? email.trim()[0] ?? "A").toUpperCase();

  const avatarId = relationId(currentUser.avatar);
  let avatarUrl: string | null = null;
  if (avatarId !== null) {
    try {
      const avatar = await payload.findByID({
        collection: "media",
        id: avatarId,
        select: { url: true },
        overrideAccess: true,
      });
      avatarUrl = avatar.url ?? null;
    } catch {
      avatarUrl = null;
    }
  }

  return {
    name: name || email,
    email,
    initial,
    role: currentUser.role,
    avatarUrl,
  };
}
