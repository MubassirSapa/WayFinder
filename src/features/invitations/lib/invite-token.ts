import "server-only";

import { createHash, randomBytes } from "crypto";

/** 7 days, matching the general token lifetime used elsewhere in this app (e.g. reset-password). */
export const INVITATION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export function hashInviteToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/** High-entropy random token — plain sha256 is correct here, not slow/adaptive hashing. */
export function generateInviteToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString("hex");
  return { rawToken, tokenHash: hashInviteToken(rawToken) };
}

export function invitationExpiresAt(): Date {
  return new Date(Date.now() + INVITATION_EXPIRY_MS);
}
