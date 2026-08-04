import type { CollectionConfig } from "payload";

import { access } from "./access";

export const Admins: CollectionConfig = {
  slug: "admins",

  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
  },

  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email"],
  },

  access: {
    create: access.isPlatformAdmin,
    read: access.isPlatformAdmin,
    update: access.isPlatformAdmin,
    delete: access.isPlatformAdmin,
  },

  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
  ],
};
