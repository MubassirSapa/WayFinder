import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import config from "@payload-config";
import { PUBLIC_ROUTES } from "@/constants/routes";
import type { User } from "@/payload-types";

import type { TopbarUser } from "../../types/dashboard.types";

export async function getTopbarUser(): Promise<TopbarUser> {
  const headers = await getHeaders();
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers });
  if (!user) redirect(PUBLIC_ROUTES.SIGNIN);

  // depth: 0 is enough — avatarUrl is a plain field (denormalized by
  // createSyncMediaUrlHook), so no populate hop into `media` is needed.
  // select trims the doc to only what's read below.
  const currentUser = await payload.findByID({
    collection: "users",
    id: (user as User).id,
    depth: 0,
    select: { name: true, email: true, role: true, avatarUrl: true },
    overrideAccess: true,
  });
  const name = currentUser.name ?? "";
  const email = currentUser.email ?? "";
  const initial = (name.trim()[0] ?? email.trim()[0] ?? "A").toUpperCase();

  return {
    name: name || email,
    email,
    initial,
    role: currentUser.role,
    avatarUrl: currentUser.avatarUrl ?? null,
  };
}
