import "server-only";

import config from "@payload-config";
import type { MapObject as PayloadMapObject } from "@/payload-types";
import { getPayload } from "payload";
import { tryCatchResponse } from "@/lib/responses";
import { asPayloadId } from "@/lib/payload-id";

import { normalizeMapObject } from "../../lib/normalizeEditorData";
import type { EditorMapObject } from "../../types/map.types";

type MapObjectData = Omit<PayloadMapObject, "id" | "createdAt" | "updatedAt">;

async function getPayloadClient() {
  return getPayload({ config });
}

export async function createMapObjectAdapter(
  data: Omit<EditorMapObject, "id" | "_clientId" | "_dirty">,
) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();
    const doc = await payload.create({
      collection: "map-objects",
      data: {
        buildingId: data.buildingId,
        floor: asPayloadId(data.floorId),
        parentObject: data.parentObjectId ? asPayloadId(data.parentObjectId) : null,
        type: data.type,
        name: data.name,
        label: data.label,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        rotation: data.rotation,
        shape: data.shape,
        points: data.points,
        isSearchable: data.isSearchable,
        isAccessible: data.isAccessible,
      },
    });
    return normalizeMapObject(doc);
  });
}

export async function updateMapObjectAdapter(
  id: string,
  data: Partial<EditorMapObject>,
) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();

    const updateData: Partial<MapObjectData> = {};
    if (data.buildingId !== undefined) updateData.buildingId = data.buildingId;
    if (data.floorId !== undefined) updateData.floor = asPayloadId(data.floorId);
    if (data.parentObjectId !== undefined) {
      updateData.parentObject = data.parentObjectId
        ? asPayloadId(data.parentObjectId)
        : null;
    }
    if (data.type !== undefined) updateData.type = data.type;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.label !== undefined) updateData.label = data.label;
    if (data.x !== undefined) updateData.x = data.x;
    if (data.y !== undefined) updateData.y = data.y;
    if (data.width !== undefined) updateData.width = data.width;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.rotation !== undefined) updateData.rotation = data.rotation;
    if (data.shape !== undefined) updateData.shape = data.shape;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.isSearchable !== undefined) {
      updateData.isSearchable = data.isSearchable;
    }
    if (data.isAccessible !== undefined) {
      updateData.isAccessible = data.isAccessible;
    }

    const doc = await payload.update({
      collection: "map-objects",
      id: asPayloadId(id),
      data: updateData,
    });
    return normalizeMapObject(doc);
  });
}

export async function deleteMapObjectAdapter(id: string) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();
    await payload.delete({
      collection: "map-objects",
      id: asPayloadId(id),
    });
    return { success: true };
  });
}
