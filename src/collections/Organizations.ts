import type { CollectionConfig } from "payload";

import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";
import { access } from "./access";
import { createSyncMediaUrlHook } from "./hooks/syncMediaUrl";

export const Organizations: CollectionConfig = {
  slug: "organizations",

  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type"],
  },

  // Every relation to `organizations` currently only reads `name`, `type`,
  // and now `logoUrl` after populating it — keep that the default so a
  // deeply nested populate (e.g. floor -> building -> organization) doesn't
  // drag the whole document along. `logoUrl` (a plain string, denormalized
  // by the hook below) is listed here deliberately instead of the `logo`
  // relation itself, so showing a logo never needs a second populate hop
  // into `media` — sidestepping the populate-restriction bug documented in
  // docs/technical/MEDIA_STORAGE.md entirely.
  defaultPopulate: {
    name: true,
    type: true,
    logoUrl: true,
  },

  hooks: {
    beforeValidate: [createSyncMediaUrlHook({ relationField: "logo", urlField: "logoUrl" })],
  },

  access: {
    // Created during public signup (via overrideAccess in the auth adapter).
    create: access.isPlatformAdmin,
    read: access.isLoggedIn,
    update: access.organizationUpdate,
    delete: access.isPlatformAdmin,
  },

  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: ORGANIZATION_TYPES.map((t) => ({ value: t.value, label: t.label })),
    },
    {
      name: "logo",
      type: "relationship",
      relationTo: "media",
    },
    {
      name: "logoUrl",
      type: "text",
      admin: { readOnly: true, hidden: true },
    },
  ],
};
