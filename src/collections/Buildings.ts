import type { CollectionConfig } from "payload";

import { access } from "./access";

export const Buildings: CollectionConfig = {
  slug: "buildings",

  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "organization", "floorCount"],
  },

  access: {
    create: access.buildingManage,
    read: access.buildingRead,
    update: access.buildingManage,
    delete: access.buildingManage,
  },

  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "organization",
      type: "relationship",
      relationTo: "organizations",
      required: true,
      index: true,
    },
    {
      name: "address",
      type: "text",
    },
    {
      name: "contactEmail",
      type: "email",
    },
    {
      name: "contactPhone",
      type: "text",
    },
    {
      name: "website",
      type: "text",
    },
    {
      name: "floorCount",
      type: "number",
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: "Cached count of floors in this building, kept in sync from the Floors collection.",
      },
    },
  ],
};
