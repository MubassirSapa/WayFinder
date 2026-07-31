import type { CollectionConfig } from "payload";

import { access } from "../access";

export const Floors: CollectionConfig = {
  slug: "floors",
  admin: {
    useAsTitle: "name",
    group: "Indoor Map",
  },

  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: "published" } }),
    create: access.isLoggedIn,
    update: access.isLoggedIn,
    delete: access.isLoggedIn,
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
      name: "backgroundImageRotation",
      type: "number",
      defaultValue: 0,
    },
    {
      name: "backgroundImageScale",
      type: "number",
      defaultValue: 1,
    },
    {
      name: "backgroundImageOpacity",
      type: "number",
      defaultValue: 0.3,
    },
    {
      name: "backgroundImageLocked",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "backgroundImageVisible",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "backgroundImageOffsetX",
      type: "number",
      defaultValue: 0,
    },
    {
      name: "backgroundImageOffsetY",
      type: "number",
      defaultValue: 0,
    },
    {
      name: "backgroundImageFit",
      type: "select",
      defaultValue: "fill",
      options: [
        { label: "Fill", value: "fill" },
        { label: "Cover", value: "cover" },
        { label: "Contain", value: "contain" },
      ],
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
