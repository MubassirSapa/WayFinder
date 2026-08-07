import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";
import { asPayloadId, relationId, relationIds } from "@/lib/payload-id";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import { signIn } from "@/features/auth/services/server/auth.ports";

import { INVITATIONS_CLIENT } from "../../constants/invitations.constants";
import { hashInviteToken } from "../../lib/invite-token";
import type { InvitationPreview, TAcceptInvitationInput } from "../../types/invitation.types";

const INVALID_INVITE_ERROR = "This invite link isn't valid.";

async function getPayloadClient() {
  return getPayload({ config });
}

export async function getInvitationPreviewAdapter(token: string) {
  return tryCatchResponse<InvitationPreview>(async () => {
    const payload = await getPayloadClient();
    const tokenHash = hashInviteToken(token);

    const result = await payload.find({
      collection: "invitations",
      overrideAccess: true,
      limit: 1,
      pagination: false,
      depth: 1,
      populate: { organizations: { name: true } },
      where: { tokenHash: { equals: tokenHash } },
    });

    const invitation = result.docs[0];
    if (!invitation || invitation.status !== "pending") throw new Error(INVALID_INVITE_ERROR);
    if (new Date(invitation.expiresAt).getTime() < Date.now()) throw new Error(INVALID_INVITE_ERROR);

    const organizationName = typeof invitation.organization === "object" ? invitation.organization.name : "";

    return {
      email: invitation.email,
      name: invitation.name,
      role: invitation.role,
      organizationName,
    };
  });
}

export async function acceptInvitationAdapter(token: string, input: TAcceptInvitationInput) {
  return tryCatchResponse<{ email: string }>(async () => {
    const payload = await getPayloadClient();
    const tokenHash = hashInviteToken(token);

    const result = await payload.find({
      collection: "invitations",
      overrideAccess: true,
      limit: 1,
      pagination: false,
      where: { tokenHash: { equals: tokenHash } },
    });

    const invitation = result.docs[0];
    if (!invitation || invitation.status !== "pending") throw new Error(INVALID_INVITE_ERROR);
    if (new Date(invitation.expiresAt).getTime() < Date.now()) throw new Error(INVALID_INVITE_ERROR);

    const existingUser = await payload.find({
      collection: "users",
      overrideAccess: true,
      limit: 1,
      pagination: false,
      depth: 0,
      select: {},
      where: { email: { equals: invitation.email } },
    });
    if (existingUser.totalDocs > 0) throw new Error(INVALID_INVITE_ERROR);

    const organizationId = relationId(invitation.organization);
    if (organizationId === null) throw new Error(INVALID_INVITE_ERROR);

    await payload.create({
      collection: "users",
      overrideAccess: true,
      data: {
        name: input.name.trim(),
        email: invitation.email,
        password: input.password,
        role: invitation.role,
        organization: asPayloadId(organizationId),
        buildings: invitation.role === "member" ? relationIds(invitation.buildings).map((id) => asPayloadId(id)) : undefined,
        _verified: true,
      },
    });

    await payload.update({
      collection: "invitations",
      id: invitation.id,
      overrideAccess: true,
      data: { status: "accepted", acceptedAt: new Date().toISOString() },
    });

    const signInResult = await signIn({ email: invitation.email, password: input.password });
    if (!signInResult.isSuccess) throw new Error(INVITATIONS_CLIENT.FALLBACK_SERVER_ERROR);

    return { email: invitation.email };
  });
}
