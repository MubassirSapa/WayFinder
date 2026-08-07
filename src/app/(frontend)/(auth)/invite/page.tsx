import type { Metadata } from "next";

import { BRAND } from "@/constants/brand";
import InviteAcceptSection from "@/features/invitations/pages/invite-accept/InviteAcceptSection";
import { getInvitationPreview } from "@/features/invitations/services/server/invitation.ports";

export const metadata: Metadata = {
  title: `Accept Invitation | ${BRAND.NAME}`,
};

export default async function InvitePage({ searchParams }: TProps) {
  const { token } = await searchParams;

  const result = token ? await getInvitationPreview(token) : null;
  const preview = result?.isSuccess ? result.data : null;

  return <InviteAcceptSection token={token} preview={preview} />;
}

type TProps = {
  searchParams: Promise<{ token?: string }>;
};
