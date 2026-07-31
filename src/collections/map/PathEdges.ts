import type { CollectionConfig } from "payload";

import { access } from "../access";

export const PathEdges: CollectionConfig = {
  slug: "path-edges",
  admin: {
    useAsTitle: "id",
    group: "Indoor Map",
  },
  access: {
    read: access.isLoggedIn,
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
      name: "floor",
      type: "relationship",
      relationTo: "floors",
      required: true,
      index: true,
    },
    {
      name: "fromNode",
      type: "relationship",
      relationTo: "map-nodes",
      required: true,
      index: true,
    },
    {
      name: "toNode",
      type: "relationship",
      relationTo: "map-nodes",
      required: true,
      index: true,
    },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "walkway",
      options: [
        { label: "Walkway", value: "walkway" },
        { label: "Stairs", value: "stairs" },
        { label: "Elevator", value: "elevator" },
        { label: "Escalator", value: "escalator" },
        { label: "Ramp", value: "ramp" },
      ],
    },
    {
      name: "distanceMeters",
      type: "number",
      required: true,
      defaultValue: 0,
    },
    {
      name: "bidirectional",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "isAccessible",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};