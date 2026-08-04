import type { CollectionConfig } from "payload";

import { access } from "../access";
import { validatePathEdgeBuilding } from "./validateBuildingRelationships";

export const PathEdges: CollectionConfig = {
  slug: "path-edges",
  admin: {
    useAsTitle: "id",
    group: "Indoor Map",
  },
  access: {
    read: access.buildingContentRead,
    create: access.buildingContentCreate,
    update: access.buildingContentUpdateDelete,
    delete: access.buildingContentUpdateDelete,
  },
  hooks: { beforeValidate: [validatePathEdgeBuilding] },
  fields: [
    {
      name: "building",
      type: "relationship",
      relationTo: "buildings",
      required: true,
      index: true,
      access: { update: ({ req }) => req.user?.collection === "admins" },
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
