import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";
import { ROLE_LABELS } from "@/collections/constants/roles";
import { asPayloadId, relationId, relationIds } from "@/lib/payload-id";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import { sendInviteEmail } from "@/features/email/services/email.ports";
import type { User } from "@/payload-types";

import { INVITATIONS_CLIENT } from "../../constants/invitations.constants";
import { generateInviteToken, invitationExpiresAt } from "../../lib/invite-token";
import type {
  InvitationRole,
  PendingInvitationListItem,
  TInviteUserInput,
  UserInviteHistory,
} from "../../types/invitation.types";

async function getPayloadClient() {
  return getPayload({ config });
}

type PendingInvitationSource = {
  id: number | string;
  name: string;
  email: string;
  role: InvitationRole;
  expiresAt: string;
  invitedBy?: number | { id: number | string; name: string } | null;
};

function toPendingInvitationListItem(target: PendingInvitationSource): PendingInvitationListItem {
  const invitedByName = target.invitedBy && typeof target.invitedBy === "object" ? target.invitedBy.name : "";

  return {
    id: String(target.id),
    name: target.name,
    email: target.email,
    role: target.role,
    invitedByName,
    expiresAt: target.expiresAt,
    isExpired: new Date(target.expiresAt).getTime() < Date.now(),
  };
}

async function getOrganizationName(payload: Awaited<ReturnType<typeof getPayload>>, organizationId: number | string) {
  const organization = await payload.findByID({
    collection: "organizations",
    id: asPayloadId(organizationId),
    depth: 0,
    select: { name: true },
    overrideAccess: true,
  });

  return organization.name;
}

const PENDING_SELECT = { name: true, email: true, role: true, expiresAt: true, invitedBy: true } as const;
// `populate` keys by the *related collection's slug* (here `users`, from `invitedBy`'s relationTo), not the field name.
const PENDING_POPULATE = { users: { name: true } } as const;

export async function createInvitationAdapter(user: User, input: TInviteUserInput) {
  return tryCatchResponse<{ email: string }>(async () => {
    const payload = await getPayloadClient();
    const organizationId = relationId(user.organization);
    if (organizationId === null) throw new Error(INVITATIONS_CLIENT.ERROR_INVITE_FAILED);

    // Independent existence checks — run together instead of one after the other.
    const [existingUser, existingInvite] = await Promise.all([
      payload.find({
        collection: "users",
        overrideAccess: true,
        limit: 1,
        pagination: false,
        depth: 0,
        select: {},
        where: { email: { equals: input.email } },
      }),
      payload.find({
        collection: "invitations",
        overrideAccess: true,
        limit: 1,
        pagination: false,
        depth: 0,
        select: {},
        where: {
          and: [
            { email: { equals: input.email } },
            { organization: { equals: organizationId } },
            { status: { equals: "pending" } },
            { expiresAt: { greater_than: new Date().toISOString() } },
          ],
        },
      }),
    ]);
    if (existingUser.totalDocs > 0) throw new Error(INVITATIONS_CLIENT.ERROR_EMAIL_TAKEN);
    if (existingInvite.totalDocs > 0) throw new Error(INVITATIONS_CLIENT.ERROR_INVITE_PENDING);

    const organizationName = await getOrganizationName(payload, organizationId);
    const { rawToken, tokenHash } = generateInviteToken();

    await payload.create({
      collection: "invitations",
      user,
      overrideAccess: false,
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
        organization: asPayloadId(organizationId),
        buildings: input.role === "member" ? input.buildingIds.map((id) => asPayloadId(id)) : undefined,
        tokenHash,
        status: "pending",
        expiresAt: invitationExpiresAt().toISOString(),
        invitedBy: asPayloadId(user.id),
      },
    });

    await sendInviteEmail({
      to: input.email,
      token: rawToken,
      organizationName,
      inviterName: user.name,
      roleLabel: ROLE_LABELS[input.role],
    });

    return { email: input.email };
  });
}

export async function resendInvitationAdapter(user: User, invitationId: string) {
  return tryCatchResponse<{ email: string }>(async () => {
    const payload = await getPayloadClient();
    const organizationId = relationId(user.organization);
    if (organizationId === null) throw new Error(INVITATIONS_CLIENT.ERROR_RESEND_FAILED);

    // `invitationRead` access already scopes this to the caller's own organization.
    const existing = await payload.findByID({
      collection: "invitations",
      id: asPayloadId(invitationId),
      depth: 0,
      select: { email: true, name: true, role: true, buildings: true },
      user,
      overrideAccess: false,
    });

    // Revoking the old invite and looking up the org name are independent of each other.
    const [, organizationName] = await Promise.all([
      payload.update({
        collection: "invitations",
        id: existing.id,
        overrideAccess: true,
        data: { status: "revoked" },
      }),
      getOrganizationName(payload, organizationId),
    ]);

    const { rawToken, tokenHash } = generateInviteToken();

    await payload.create({
      collection: "invitations",
      overrideAccess: true,
      data: {
        email: existing.email,
        name: existing.name,
        role: existing.role,
        organization: asPayloadId(organizationId),
        buildings: relationIds(existing.buildings).map((id) => asPayloadId(id)),
        tokenHash,
        status: "pending",
        expiresAt: invitationExpiresAt().toISOString(),
        invitedBy: asPayloadId(user.id),
      },
    });

    await sendInviteEmail({
      to: existing.email,
      token: rawToken,
      organizationName,
      inviterName: user.name,
      roleLabel: ROLE_LABELS[existing.role],
    });

    return { email: existing.email };
  });
}

export async function revokeInvitationAdapter(user: User, invitationId: string) {
  return tryCatchResponse<{ id: string }>(async () => {
    const payload = await getPayloadClient();

    // `invitationRead` access already scopes this to the caller's own organization.
    const existing = await payload.findByID({
      collection: "invitations",
      id: asPayloadId(invitationId),
      depth: 0,
      select: {},
      user,
      overrideAccess: false,
    });

    await payload.update({
      collection: "invitations",
      id: existing.id,
      overrideAccess: true,
      data: { status: "revoked" },
    });

    return { id: String(existing.id) };
  });
}

export async function listPendingInvitationsAdapter(user: User) {
  return tryCatchResponse<PendingInvitationListItem[]>(async () => {
    const payload = await getPayloadClient();
    const organizationId = relationId(user.organization);
    if (organizationId === null) return [];

    const result = await payload.find({
      collection: "invitations",
      depth: 1,
      limit: 0,
      pagination: false,
      select: PENDING_SELECT,
      populate: PENDING_POPULATE,
      sort: "-createdAt",
      where: { and: [{ organization: { equals: organizationId } }, { status: { equals: "pending" } }] },
      user,
      overrideAccess: false,
    });

    return result.docs.map(toPendingInvitationListItem);
  });
}

/** Resolved invite history for a user's detail page — null for users who predate this feature or were the org's original signup owner. */
export async function getUserInviteHistoryAdapter(user: User, email: string): Promise<UserInviteHistory | null> {
  const payload = await getPayloadClient();
  const organizationId = relationId(user.organization);
  if (organizationId === null) return null;

  const result = await payload.find({
    collection: "invitations",
    overrideAccess: true,
    limit: 1,
    pagination: false,
    depth: 1,
    sort: "-acceptedAt",
    select: { invitedBy: true, createdAt: true, acceptedAt: true },
    populate: { users: { name: true } },
    where: {
      and: [
        { email: { equals: email } },
        { organization: { equals: organizationId } },
        { status: { equals: "accepted" } },
      ],
    },
  });

  const invitation = result.docs[0];
  if (!invitation) return null;

  const invitedByName = typeof invitation.invitedBy === "object" ? invitation.invitedBy.name : "";

  return {
    invitedByName,
    invitedAt: invitation.createdAt,
    acceptedAt: invitation.acceptedAt ?? null,
  };
}
