import type { CollectionAfterChangeHook } from "payload";
import { createElement } from "react";
import { render } from "react-email";

import { requireEnv } from "@/lib/env";
import { NewOrganizationEmailTemplate } from "@/features/email/templates/NewOrganizationEmail";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * Emails the platform admin inbox whenever a new organization signs up, so
 * it can be reviewed before `approved` is set. Swallows send failures — a
 * flaky notification email must never fail the signup transaction that
 * created the organization.
 */
export const notifyAdminOfNewOrgHook: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== "create") return doc;

  try {
    const html = await render(
      createElement(NewOrganizationEmailTemplate, {
        organizationName: doc.name,
        organizationType: doc.type,
        reviewUrl: `${serverUrl}/admin/collections/organizations/${doc.id}`,
      }),
    );

    await req.payload.sendEmail({
      to: requireEnv("ADMIN_EMAIL"),
      subject: `New organization awaiting review: ${doc.name}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send new-organization admin notification email:", error);
  }

  return doc;
};
