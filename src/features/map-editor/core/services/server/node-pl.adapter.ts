import "server-only";

import config from "@payload-config";
import type { MapNode as PayloadMapNode } from "@/payload-types";
import { getPayload } from "payload";
import { tryCatchResponse } from "@/lib/responses";

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
      buildingId: data.buildingId,
      floor: Number(data.floorId),
      object: data.objectId ? Number(data.objectId) : null,
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
    if (data.buildingId !== undefined) updateData.buildingId = data.buildingId;
    if (data.floorId !== undefined) updateData.floor = Number(data.floorId);
    if (data.objectId !== undefined) {
      updateData.object = data.objectId ? Number(data.objectId) : null;
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
      id: Number(id),
      data: updateData,
    });
    return normalizeMapNode(doc);
  });
}

export async function deleteMapNodeAdapter(id: string) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();

    const linkedEdges = await payload.find({
      collection: "path-edges",
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      where: {
        or: [
          {
            fromNode: {
              equals: Number(id),
            },
          },
          {
            toNode: {
              equals: Number(id),
            },
          },
        ],
      },
    });

    for (const edge of linkedEdges.docs) {
      await payload.delete({
        collection: "path-edges",
        id: Number(edge.id),
      });
    }

    await payload.delete({
      collection: "map-nodes",
      id: Number(id),
    });
    return { success: true };
  });
}
