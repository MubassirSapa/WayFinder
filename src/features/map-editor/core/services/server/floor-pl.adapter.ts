import "server-only";

import config from "@payload-config";
import type {
  Floor as PayloadFloor,
} from "@/payload-types";
import { getPayload } from "payload";
import { tryCatchResponse } from "@/lib/responses";
import { asPayloadId } from "@/lib/payload-id";

import {
  normalizeFloor,
  normalizeMapNode,
  normalizeMapObject,
  normalizePathEdge,
} from "../../lib/normalizeEditorData";
import type { EditorFloor } from "../../types/map.types";
import type { FloorEditorData } from "../../types/editor.types";

type FloorData = Omit<PayloadFloor, "id" | "createdAt" | "updatedAt">;

async function getPayloadClient() {
  return getPayload({ config });
}

export async function getFloorEditorDataAdapter(floorId: string) {
  return tryCatchResponse<FloorEditorData>(async () => {
    const payload = await getPayloadClient();
    const [floorDoc, objectsResult, nodesResult, edgesResult] = await Promise.all([
      payload.findByID({
        collection: "floors",
        id: asPayloadId(floorId),
        depth: 1,
        overrideAccess: true,
      }),
      payload.find({
        collection: "map-objects",
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        where: {
          floor: {
            equals: asPayloadId(floorId),
          },
        },
      }),
      payload.find({
        collection: "map-nodes",
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        where: {
          floor: {
            equals: asPayloadId(floorId),
          },
        },
      }),
      payload.find({
        collection: "path-edges",
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        where: {
          floor: {
            equals: asPayloadId(floorId),
          },
        },
      }),
    ]);

    return {
      floor: normalizeFloor(floorDoc),
      objects: objectsResult.docs.map(normalizeMapObject),
      nodes: nodesResult.docs.map(normalizeMapNode),
      edges: edgesResult.docs.map(normalizePathEdge),
    };
  });
}

export async function updateFloorAdapter(id: string, data: Partial<EditorFloor>) {
  return tryCatchResponse(async () => {
    const payload = await getPayloadClient();

    const updateData: Partial<FloorData> & {
      backgroundImage?: null | number;
      metersPerPixel?: null | number;
    } = {};

    if (data.buildingId !== undefined) updateData.building = asPayloadId(data.buildingId);
    if (data.name !== undefined) updateData.name = data.name;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.width !== undefined) updateData.width = data.width;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.metersPerPixel !== undefined) {
      updateData.metersPerPixel = data.metersPerPixel ?? null;
    }
    if (data.backgroundImageId !== undefined) {
      updateData.backgroundImage = data.backgroundImageId
        ? asPayloadId(data.backgroundImageId)
        : null;
      updateData.backgroundImageUrl = null;
    } else if (data.backgroundImageUrl !== undefined) {
      updateData.backgroundImageUrl = data.backgroundImageUrl;
    }
    if (data.backgroundImageRotation !== undefined) {
      updateData.backgroundImageRotation = data.backgroundImageRotation;
    }
    if (data.backgroundImageScale !== undefined) {
      updateData.backgroundImageScale = data.backgroundImageScale;
    }
    if (data.backgroundImageOpacity !== undefined) {
      updateData.backgroundImageOpacity = data.backgroundImageOpacity;
    }
    if (data.backgroundImageLocked !== undefined) {
      updateData.backgroundImageLocked = data.backgroundImageLocked;
    }
    if (data.backgroundImageVisible !== undefined) {
      updateData.backgroundImageVisible = data.backgroundImageVisible;
    }
    if (data.backgroundImageOffsetX !== undefined) {
      updateData.backgroundImageOffsetX = data.backgroundImageOffsetX;
    }
    if (data.backgroundImageOffsetY !== undefined) {
      updateData.backgroundImageOffsetY = data.backgroundImageOffsetY;
    }
    if (data.backgroundImageFit !== undefined) {
      updateData.backgroundImageFit = data.backgroundImageFit;
    }
    if (data.status !== undefined) updateData.status = data.status;

    const doc = await payload.update({
      collection: "floors",
      id: asPayloadId(id),
      depth: 1,
      data: updateData,
      overrideAccess: true,
    });

    return normalizeFloor(doc);
  });
}
