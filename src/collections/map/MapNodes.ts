import type { CollectionConfig } from "payload";

import { access } from "../access";
import { validateMapNodeBuilding } from "./validateBuildingRelationships";

export const MapNodes: CollectionConfig = {
  slug: "map-nodes",
  admin: {
    useAsTitle: "label",
    group: "Indoor Map",
  },
  access: {
    read: access.buildingContentRead,
    create: access.buildingContentCreate,
    update: access.buildingContentUpdateDelete,
    delete: access.buildingContentUpdateDelete,
  },
  hooks: { beforeValidate: [validateMapNodeBuilding] },
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
      name: "object",
      type: "relationship",
      relationTo: "map-objects",
      required: false,
      index: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      options: [
        { label: "Entrance", value: "entrance" },
        { label: "Exit", value: "exit" },
        { label: "Hallway Point", value: "hallway_point" },
        { label: "Stairs Entry", value: "stairs_entry" },
        { label: "Elevator Entry", value: "elevator_entry" },
        { label: "Escalator Entry", value: "escalator_entry" },
        { label: "Shelf Access", value: "shelf_access" },
      ],
    },
    {
      name: "label",
      type: "text",
    },
    {
      name: "x",
      type: "number",
      required: true,
      defaultValue: 0,
    },
    {
      name: "y",
      type: "number",
      required: true,
      defaultValue: 0,
    },
    {
      name: "width",
      type: "number",
    },
    {
      name: "height",
      type: "number",
    },
    {
      name: "rotation",
      type: "number",
      defaultValue: 0,
    },
    {
      name: "geometryType",
      type: "select",
      required: true,
      defaultValue: "rectangle",
      options: [
        { label: "Rectangle", value: "rectangle" },
        { label: "Polygon", value: "polygon" },
        { label: "Line", value: "line" },
        { label: "Icon", value: "icon" },
      ],
    },
    {
      name: "points",
      type: "array",
      fields: [
        {
          name: "x",
          type: "number",
          required: true,
        },
        {
          name: "y",
          type: "number",
          required: true,
        },
      ],
    },
    {
      name: "isAccessible",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
