import type { CollectionConfig } from "payload";

export const Floors: CollectionConfig = {
  slug: "floors",
  admin: {
    useAsTitle: "name",
    group: "Indoor Map",
  },

  fields: [
    {
      name: "buildingId",
      type: "text",
      required: true,
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "level",
      type: "number",
      required: true,
      defaultValue: 0,
    },
    {
      name: "width",
      type: "number",
      required: true,
      defaultValue: 1200,
    },
    {
      name: "height",
      type: "number",
      required: true,
      defaultValue: 800,
    },
    {
      name: "metersPerPixel",
      type: "number",
      defaultValue: 0.05,
    },
    {
      name: "backgroundImage",
      type: "relationship",
      relationTo: "media",
    },
    {
      name: "backgroundImageUrl",
      type: "text",
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
  ],
};
