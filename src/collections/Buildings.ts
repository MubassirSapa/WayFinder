import type { CollectionConfig } from "payload";

import { access } from "./access";

export const Buildings: CollectionConfig = {
  slug: "buildings",

  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "organization", "floorCount"],
  },

  // Places that populate `building` (public map viewer, public landing page)
  // only ever read `name` and, transitively, `organization.name` — keep the
  // address/contact/floorCount fields out of every populated copy.
  defaultPopulate: {
    name: true,
    organization: true,
  },

  access: {
    create: access.buildingCreate,
    read: access.buildingRead,
    update: access.buildingUpdateDelete,
    delete: access.buildingUpdateDelete,
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
      access: {
        update: ({ req }) => req.user?.collection === "admins",
      },
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
