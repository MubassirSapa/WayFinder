import "server-only";

import config from "@payload-config";
import type {
  Floor as PayloadFloor,
  Media as PayloadMedia,
} from "@/payload-types";
import { getPayload } from "payload";
import { tryCatchResponse } from "@/lib/responses";

import {
  normalizeFloor,
  normalizeMapNode,
  normalizeMapObject,
  normalizePathEdge,
} from "../../lib/normalizeEditorData";
import type { EditorFloor } from "../../types/map.types";
import type { FloorEditorData, UploadedReferenceImage } from "../../types/editor.types";

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
        id: Number(floorId),
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
            equals: Number(floorId),
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
            equals: Number(floorId),
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
            equals: Number(floorId),
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

    if (data.buildingId !== undefined) updateData.buildingId = data.buildingId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.width !== undefined) updateData.width = data.width;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.metersPerPixel !== undefined) {
      updateData.metersPerPixel = data.metersPerPixel ?? null;
    }
    if (data.backgroundImageId !== undefined) {
      updateData.backgroundImage = data.backgroundImageId
        ? Number(data.backgroundImageId)
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
      id: Number(id),
      depth: 1,
      data: updateData,
      overrideAccess: true,
    });

    return normalizeFloor(doc);
  });
}

export async function uploadFloorReferenceImageAdapter(formData: FormData) {
  return tryCatchResponse<UploadedReferenceImage>(async () => {
    const fileEntry = formData.get("file");
    const altEntry = formData.get("alt");

    if (!(fileEntry instanceof File) || fileEntry.size === 0) {
      throw new Error("A reference image file is required.");
    }

    const alt =
      typeof altEntry === "string" && altEntry.trim().length > 0
        ? altEntry.trim()
        : "Floor reference image";

    const payload = await getPayloadClient();
    const buffer = Buffer.from(await fileEntry.arrayBuffer());

    const doc = await payload.create({
      collection: "media",
      data: {
        alt,
      },
      file: {
        data: buffer,
        mimetype: fileEntry.type || "application/octet-stream",
        name: fileEntry.name,
        size: fileEntry.size,
      },
      overrideAccess: true,
    } as never) as PayloadMedia;

    return {
      alt: doc.alt,
      filename: doc.filename ?? null,
      id: String(doc.id),
      url: doc.url ?? null,
      width: doc.width ?? null,
      height: doc.height ?? null,
    };
  });
}
