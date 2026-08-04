import "server-only";

import config from "@payload-config";
import type { MapNode as PayloadMapNode } from "@/payload-types";
import { getPayload } from "payload";
import { tryCatchResponse } from "@/lib/responses";
import { asPayloadId } from "@/lib/payload-id";

import { normalizeMapNode } from "../../lib/normalizeEditorData";
import type { EditorMapNode } from "../../types/map.types";

type MapNodeData = Omit<PayloadMapNode, "id" | "createdAt" | "updatedAt">;

async function getPayloadClient() {
  return getPayload({ config });
}

export async function createMapNodeAdapter(
  data: Omit<EditorMapNode, "id" | "_clientId" | "_dirty">,
) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();
    const createData: MapNodeData = {
      building: asPayloadId(data.buildingId),
      floor: asPayloadId(data.floorId),
      object: data.objectId ? asPayloadId(data.objectId) : null,
      role: data.role,
      label: data.label,
      x: data.x,
      y: data.y,
      geometryType: data.geometryType ?? "icon",
      isAccessible: data.isAccessible,
    };

    if (data.width !== undefined) createData.width = data.width;
    if (data.height !== undefined) createData.height = data.height;
    if (data.rotation !== undefined) createData.rotation = data.rotation;
    if (Array.isArray(data.points)) {
      createData.points = data.points.map((point) => ({
        x: point.x,
        y: point.y,
      }));
    }

    const doc = await payload.create({
      collection: "map-nodes",
      data: createData,
    });
    return normalizeMapNode(doc);
  });
}

export async function updateMapNodeAdapter(id: string, data: Partial<EditorMapNode>) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();

    const updateData: Partial<MapNodeData> = {};
    if (data.buildingId !== undefined) updateData.building = asPayloadId(data.buildingId);
    if (data.floorId !== undefined) updateData.floor = asPayloadId(data.floorId);
    if (data.objectId !== undefined) {
      updateData.object = data.objectId ? asPayloadId(data.objectId) : null;
    }
    if (data.role !== undefined) updateData.role = data.role;
    if (data.label !== undefined) updateData.label = data.label;
    if (data.x !== undefined) updateData.x = data.x;
    if (data.y !== undefined) updateData.y = data.y;
    if (data.width !== undefined) updateData.width = data.width;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.rotation !== undefined) updateData.rotation = data.rotation;
    if (data.geometryType !== undefined) {
      updateData.geometryType = data.geometryType;
    }
    if (Array.isArray(data.points)) {
      updateData.points = data.points.map((point) => ({
        x: point.x,
        y: point.y,
      }));
    }
    if (data.isAccessible !== undefined) {
      updateData.isAccessible = data.isAccessible;
    }

    const doc = await payload.update({
      collection: "map-nodes",
      id: asPayloadId(id),
      data: updateData,
    });
    return normalizeMapNode(doc);
  });
}

export async function deleteMapNodeAdapter(id: string) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();

    // Bulk delete-by-where in one call instead of finding linked edges and
    // deleting each one individually.
    await payload.delete({
      collection: "path-edges",
      overrideAccess: true,
      where: {
        or: [
          {
            fromNode: {
              equals: asPayloadId(id),
            },
          },
          {
            toNode: {
              equals: asPayloadId(id),
            },
          },
        ],
      },
    });

    await payload.delete({
      collection: "map-nodes",
      id: asPayloadId(id),
    });
    return { success: true };
  });
}
