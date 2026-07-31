import "server-only";

import { createElement } from "react";
import { render } from "react-email";
import { getPayload } from "payload";

import config from "@payload-config";
import { ROLES } from "@/collections/constants/roles";
import { BRAND } from "@/constants/brand";
import { WelcomeEmailTemplate } from "@/features/email/templates/WelcomeEmail";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

async function getPayloadClient() {
  return getPayload({ config });
}

export async function sendOwnerWelcomeEmailAdapter(userId: string) {
  const payload = await getPayloadClient();

  return tryCatchResponse(async () => {
    const user = await payload.findByID({
      collection: "users",
      id: userId,
      overrideAccess: true,
    });

    if (user.role !== ROLES.ADMIN) {
      return null;
    }

    const html = await render(
      createElement(WelcomeEmailTemplate, {
        signinUrl: `${serverUrl}/signin`,
        userName: user.name,
      }),
    );

    return payload.sendEmail({
      to: user.email,
      subject: `Welcome to ${BRAND.NAME}`,
      html,
    });
  });
}
