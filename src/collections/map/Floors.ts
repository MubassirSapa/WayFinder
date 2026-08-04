import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, Payload } from "payload";

import { relationId } from "@/lib/payload-id";
import { access } from "../access";

/** Keep `buildings.floorCount` in sync so dashboards can read it without an extra query. */
async function syncFloorCount(payload: Payload, buildingId: number | string) {
  const floors = await payload.find({
    collection: "floors",
    where: { building: { equals: buildingId } },
    limit: 0,
    depth: 0,
    overrideAccess: true,
  });

  await payload.update({
    collection: "buildings",
    id: buildingId,
    data: { floorCount: floors.totalDocs },
    overrideAccess: true,
  });
}

function isValidBuildingId(id: number | string | null): id is number | string {
  if (id === null) return false;
  return typeof id === "number" ? Number.isFinite(id) : id.length > 0;
}

const syncFloorCountOnChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const buildingIds = new Set(
    [relationId(doc.building), relationId(previousDoc?.building)].filter(isValidBuildingId),
  );

  await Promise.all(Array.from(buildingIds, (buildingId) => syncFloorCount(req.payload, buildingId)));
};

const syncFloorCountOnDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const buildingId = relationId(doc.building);
  if (isValidBuildingId(buildingId)) await syncFloorCount(req.payload, buildingId);
};

export const Floors: CollectionConfig = {
  slug: "floors",
  admin: {
    useAsTitle: "name",
    group: "Indoor Map",
  },

  access: {
    read: (args) => (args.req.user ? access.buildingContentRead(args) : { status: { equals: "published" } }),
    create: access.buildingContentWrite,
    update: access.buildingContentWrite,
    delete: access.buildingContentWrite,
  },

  hooks: {
    afterChange: [syncFloorCountOnChange],
    afterDelete: [syncFloorCountOnDelete],
  },

  fields: [
    {
      name: "building",
      type: "relationship",
      relationTo: "buildings",
      required: true,
      index: true,
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
