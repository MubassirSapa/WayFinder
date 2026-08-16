import type { CollectionAfterChangeHook } from "payload";
import { createElement } from "react";
import { render } from "react-email";

import { BRAND } from "@/constants/brand";
import { ROLES } from "@/collections/constants/roles";
import { OrgApprovedEmailTemplate } from "@/features/email/templates/OrgApprovedEmail";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * When a platform admin flips `approved` from false to true, pushes
 * `orgApproved: true` onto every user already in that organization (new
 * users pick it up at creation time instead, see `syncUserOrgApprovalHook`)
 * and emails the owner that they can start using the dashboard. Only fires
 * on the false-to-true transition, never on creation or a later edit.
 */
export const syncOrgApprovalHook: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== "update" || !doc.approved || previousDoc?.approved) return doc;

  await req.payload.update({
    collection: "users",
    where: { organization: { equals: doc.id } },
    data: { orgApproved: true },
    overrideAccess: true,
  });

  const owners = await req.payload.find({
    collection: "users",
    where: { organization: { equals: doc.id }, role: { equals: ROLES.OWNER } },
    limit: 1,
    depth: 0,
    select: { email: true },
    overrideAccess: true,
  });

  const owner = owners.docs[0];
  if (!owner) return doc;

  try {
    const html = await render(
      createElement(OrgApprovedEmailTemplate, {
        organizationName: doc.name,
        signinUrl: `${serverUrl}/signin`,
      }),
    );

    await req.payload.sendEmail({
      to: owner.email,
      subject: `${doc.name} is approved on ${BRAND.NAME}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send org-approved email:", error);
  }

  return doc;
};
