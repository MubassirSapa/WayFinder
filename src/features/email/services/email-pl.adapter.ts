import "server-only";

import { createElement } from "react";
import { render } from "react-email";
import { getPayload } from "payload";

import config from "@payload-config";
import { BRAND } from "@/constants/brand";
import { InviteUserEmailTemplate } from "@/features/email/templates/InviteUserEmail";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

async function getPayloadClient() {
  return getPayload({ config });
}

export type SendInviteEmailParams = {
  to: string;
  token: string;
  organizationName: string;
  inviterName: string;
  roleLabel: string;
};

export async function sendInviteEmailAdapter(params: SendInviteEmailParams) {
  const payload = await getPayloadClient();

  return tryCatchResponse(async () => {
    const html = await render(
      createElement(InviteUserEmailTemplate, {
        inviteUrl: `${serverUrl}/invite?token=${params.token}`,
        organizationName: params.organizationName,
        inviterName: params.inviterName,
        roleLabel: params.roleLabel,
      }),
    );

    return payload.sendEmail({
      to: params.to,
      subject: `You're invited to join ${params.organizationName} on ${BRAND.NAME}`,
      html,
    });
  });
}
