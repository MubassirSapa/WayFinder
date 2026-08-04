import type { CollectionBeforeValidateHook, Payload } from "payload";

import { relationId } from "@/lib/payload-id";

type MapCollection = "floors" | "map-objects" | "map-nodes";

async function assertRelationBuilding(
  payload: Payload,
  collection: MapCollection,
  value: unknown,
  building: unknown,
  field: string,
) {
  const id = relationId(value);
  const buildingId = relationId(building);
  if (id === null || buildingId === null) return;

  const related = await payload.findByID({
    collection,
    id,
    depth: 0,
    select: { building: true },
    overrideAccess: true,
  });

  if (String(relationId(related.building)) !== String(buildingId)) {
    throw new Error(`${field} must belong to the selected building.`);
  }
}

export const validateMapObjectBuilding: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const next = { ...originalDoc, ...data };
  await assertRelationBuilding(req.payload, "floors", next.floor, next.building, "floor");
  if (next.parentObject) {
    await assertRelationBuilding(req.payload, "map-objects", next.parentObject, next.building, "parentObject");
  }
  return data;
};

export const validateMapNodeBuilding: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const next = { ...originalDoc, ...data };
  await assertRelationBuilding(req.payload, "floors", next.floor, next.building, "floor");
  if (next.object) {
    await assertRelationBuilding(req.payload, "map-objects", next.object, next.building, "object");
  }
  return data;
};

export const validatePathEdgeBuilding: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const next = { ...originalDoc, ...data };
  await Promise.all([
    assertRelationBuilding(req.payload, "floors", next.floor, next.building, "floor"),
    assertRelationBuilding(req.payload, "map-nodes", next.fromNode, next.building, "fromNode"),
    assertRelationBuilding(req.payload, "map-nodes", next.toNode, next.building, "toNode"),
  ]);
  return data;
};
