import "server-only";

import config from "@payload-config";
import type { PathEdge as PayloadPathEdge } from "@/payload-types";
import { getPayload } from "payload";
import { tryCatchResponse } from "@/lib/responses";

import { normalizePathEdge } from "../lib/normalizeEditorData";
import type { EditorPathEdge } from "../types/map.types";

type PathEdgeData = Omit<PayloadPathEdge, "id" | "createdAt" | "updatedAt">;

async function getPayloadClient() {
  return getPayload({ config });
}

export async function createPathEdgeAdapter(
  data: Omit<EditorPathEdge, "id" | "_clientId" | "_dirty">,
) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();
    const doc = await payload.create({
      collection: "path-edges",
      data: {
        buildingId: data.buildingId,
        floor: Number(data.floorId),
        fromNode: Number(data.fromNodeId),
        toNode: Number(data.toNodeId),
        type: data.type,
        distanceMeters: data.distanceMeters,
        bidirectional: data.bidirectional,
        isAccessible: data.isAccessible,
      },
    });
    return normalizePathEdge(doc);
  });
}

export async function updatePathEdgeAdapter(
  id: string,
  data: Partial<EditorPathEdge>,
) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();

    const updateData: Partial<PathEdgeData> = {};
    if (data.buildingId !== undefined) updateData.buildingId = data.buildingId;
    if (data.floorId !== undefined) updateData.floor = Number(data.floorId);
    if (data.fromNodeId !== undefined) {
      updateData.fromNode = Number(data.fromNodeId);
    }
    if (data.toNodeId !== undefined) {
      updateData.toNode = Number(data.toNodeId);
    }
    if (data.type !== undefined) updateData.type = data.type;
    if (data.distanceMeters !== undefined) {
      updateData.distanceMeters = data.distanceMeters;
    }
    if (data.bidirectional !== undefined) {
      updateData.bidirectional = data.bidirectional;
    }
    if (data.isAccessible !== undefined) {
      updateData.isAccessible = data.isAccessible;
    }

    const doc = await payload.update({
      collection: "path-edges",
      id: Number(id),
      data: updateData,
    });
    return normalizePathEdge(doc);
  });
}

export async function deletePathEdgeAdapter(id: string) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();
    await payload.delete({
      collection: "path-edges",
      id: Number(id),
    });
    return { success: true };
  });
}
