import type { CollectionBeforeChangeHook } from "payload";

import { relationId } from "@/lib/payload-id";

/**
 * A new user inherits their organization's current `approved` status at
 * creation time — the owner created at signup starts unapproved, while a
 * teammate invited after the org was already approved starts approved
 * immediately. Later approvals are pushed to existing users by
 * `syncOrgApprovalHook` on `Organizations`.
 */
export const syncUserOrgApprovalHook: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== "create") return data;

  const organizationId = relationId(data.organization);
  if (organizationId === null) return data;

  const organization = await req.payload.findByID({
    collection: "organizations",
    id: organizationId,
    depth: 0,
    select: { approved: true },
    overrideAccess: true,
  });

  return { ...data, orgApproved: Boolean(organization.approved) };
};
