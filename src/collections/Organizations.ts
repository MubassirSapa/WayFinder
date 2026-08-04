import type { CollectionConfig } from "payload";

import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";
import { access } from "./access";

export const Organizations: CollectionConfig = {
  slug: "organizations",

  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type"],
  },

  access: {
    // Created during public signup (via overrideAccess in the auth adapter).
    create: access.isAdmin,
    read: access.isLoggedIn,
    update: access.isAdmin,
    delete: access.isAdmin,
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
      name: "contact",
      type: "group",
      fields: [
        {
          name: "email",
          type: "email",
        },
        {
          name: "phone",
          type: "text",
          maxLength: 30,
        },
        {
          name: "website",
          type: "text",
          maxLength: 2048,
        },
      ],
    },
    {
      name: "address",
      type: "group",
      fields: [
        {
          name: "line1",
          label: "Address line 1",
          type: "text",
          maxLength: 120,
        },
        {
          name: "line2",
          label: "Address line 2",
          type: "text",
          maxLength: 120,
        },
        {
          name: "city",
          type: "text",
          maxLength: 80,
        },
        {
          name: "region",
          label: "Province, state, or region",
          type: "text",
          maxLength: 80,
        },
        {
          name: "postalCode",
          label: "Postal or ZIP code",
          type: "text",
          maxLength: 20,
        },
        {
          name: "country",
          type: "text",
          maxLength: 80,
        },
      ],
    },
  ],
};
