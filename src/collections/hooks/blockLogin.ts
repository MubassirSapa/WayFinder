import type { CollectionBeforeLoginHook } from "payload";

import type { User } from "@/payload-types";

/** Blocks sign-in for a user with `blocked: true` — an owner/manager-initiated block, distinct from Payload's own failed-login lockout. */
export const blockLoginHook: CollectionBeforeLoginHook<User> = ({ user }) => {
  if (user.blocked) throw new Error("This account has been blocked.");
  return user;
};
