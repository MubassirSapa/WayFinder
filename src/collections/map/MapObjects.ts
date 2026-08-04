import type { CollectionConfig } from "payload";

import { access } from "../access";
import { validateMapObjectBuilding } from "./validateBuildingRelationships";

export const MapObjects: CollectionConfig = {
  slug: "map-objects",
  admin: {
    useAsTitle: "name",
    group: "Indoor Map",
  },

  access: {
    read: access.buildingContentRead,
    create: access.buildingContentCreate,
    update: access.buildingContentUpdateDelete,
    delete: access.buildingContentUpdateDelete,
  },

  hooks: { beforeValidate: [validateMapObjectBuilding] },

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
      name: "parentObject",
      type: "relationship",
      relationTo: "map-objects",
      required: false,
      index: true,
    },
    
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Room", value: "room" },
        { label: "Wall", value: "wall" },
        { label: "Door", value: "door" },
        { label: "Hallway", value: "hallway" },
        { label: "Stairs", value: "stairs" },
        { label: "Elevator", value: "elevator" },
        { label: "Escalator", value: "escalator" },
        { label: "Washroom", value: "washroom" },
        { label: "Exit", value: "exit" },
        { label: "POI", value: "poi" },
        { label: "Aisle", value: "aisle" },
        { label: "Shelf", value: "shelf" },
        { label: "Section", value: "section" },
      ],
    },
    {
      name: "name",
      type: "text",
      required: true,
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
      name: "shape",
      type: "select",
      defaultValue: "rectangle",
      options: [
        { label: "Rectangle", value: "rectangle" },
        { label: "Ellipse", value: "ellipse" },
        { label: "Custom", value: "polygon" },
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
      name: "isSearchable",
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
