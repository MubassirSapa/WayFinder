'use server';

import config from "@payload-config";
import type {
  MapNode as PayloadMapNode,
  MapObject as PayloadMapObject,
  PathEdge as PayloadPathEdge,
} from "@/payload-types";
import { getPayload } from "payload";

import {
  normalizeFloor,
  normalizeMapNode,
  normalizeMapObject,
  normalizePathEdge,
} from "../lib/normalizeEditorData";
import {
  EditorFloor,
  EditorMapObject,
  EditorMapNode,
  EditorPathEdge,
} from "../types/map.types";

type MapNodeData = Omit<PayloadMapNode, "id" | "createdAt" | "updatedAt">;
type MapObjectData = Omit<PayloadMapObject, "id" | "createdAt" | "updatedAt">;
type PathEdgeData = Omit<PayloadPathEdge, "id" | "createdAt" | "updatedAt">;

export interface FloorEditorData {
  floor: EditorFloor;
  objects: EditorMapObject[];
  nodes: EditorMapNode[];
  edges: EditorPathEdge[];
}

async function getPayloadClient() {
  return getPayload({ config });
}

export async function getFloorEditorData(floorId: string): Promise<FloorEditorData> {
  try {
    const payload = await getPayloadClient();
    const [floorDoc, objectsResult, nodesResult, edgesResult] = await Promise.all([
      payload.findByID({
        collection: "floors",
        id: Number(floorId),
        depth: 0,
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
  } catch (error: any) {
    console.error("Error loading floor editor data:", error);
    throw new Error(error?.message || "Failed to load floor editor data");
  }
}

export async function createMapObject(
  data: Omit<EditorMapObject, "id" | "_clientId" | "_dirty">,
) {
  try {
    const payload = await getPayloadClient();
    const doc = await payload.create({
      collection: "map-objects",
      data: {
        buildingId: data.buildingId,
        floor: Number(data.floorId),
        parentObject: data.parentObjectId ? Number(data.parentObjectId) : null,
        type: data.type,
        name: data.name,
        label: data.label,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        rotation: data.rotation,
        isSearchable: data.isSearchable,
        isAccessible: data.isAccessible,
      },
    });
    return normalizeMapObject(doc);
  } catch (error) {
    console.error("Error creating map object:", error);
    throw new Error((error as Error)?.message || "Failed to create map object");
  }
}

export async function updateMapObject(
  id: string,
  data: Partial<EditorMapObject>,
) {
  try {
    const payload = await getPayloadClient();

    const updateData: Partial<MapObjectData> = {};
    if (data.buildingId !== undefined) updateData.buildingId = data.buildingId;
    if (data.floorId !== undefined) updateData.floor = Number(data.floorId);
    if (data.parentObjectId !== undefined) {
      updateData.parentObject = data.parentObjectId
        ? Number(data.parentObjectId)
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
    if (data.isSearchable !== undefined) {
      updateData.isSearchable = data.isSearchable;
    }
    if (data.isAccessible !== undefined) {
      updateData.isAccessible = data.isAccessible;
    }

    const doc = await payload.update({
      collection: "map-objects",
      id: Number(id),
      data: updateData,
    });
    return normalizeMapObject(doc);
  } catch (error) {
    console.error("Error updating map object:", error);
    throw new Error((error as Error)?.message || "Failed to update map object");
  }
}

export async function deleteMapObject(id: string) {
  try {
    const payload = await getPayloadClient();
    await payload.delete({
      collection: "map-objects",
      id: Number(id),
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting map object:", error);
    throw new Error((error as Error)?.message || "Failed to delete map object");
  }
}

export async function createMapNode(
  data: Omit<EditorMapNode, "id" | "_clientId" | "_dirty">,
) {
  try {
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
  } catch (error) {
    console.error("Error creating map node:", error);
    throw new Error((error as Error)?.message || "Failed to create map node");
  }
}

export async function updateMapNode(id: string, data: Partial<EditorMapNode>) {
  try {
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
  } catch (error) {
    console.error("Error updating map node:", error);
    throw new Error((error as Error)?.message || "Failed to update map node");
  }
}

export async function deleteMapNode(id: string) {
  try {
    const payload = await getPayloadClient();
    await payload.delete({
      collection: "map-nodes",
      id: Number(id),
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting map node:", error);
    throw new Error((error as Error)?.message || "Failed to delete map node");
  }
}

export async function createPathEdge(
  data: Omit<EditorPathEdge, "id" | "_clientId" | "_dirty">,
) {
  try {
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
  } catch (error) {
    console.error("Error creating path edge:", error);
    throw new Error((error as Error)?.message || "Failed to create path edge");
  }
}

export async function updatePathEdge(
  id: string,
  data: Partial<EditorPathEdge>,
) {
  try {
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
  } catch (error) {
    console.error("Error updating path edge:", error);
    throw new Error((error as Error)?.message || "Failed to update path edge");
  }
}

export async function deletePathEdge(id: string) {
  try {
    const payload = await getPayloadClient();
    await payload.delete({
      collection: "path-edges",
      id: Number(id),
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting path edge:", error);
    throw new Error((error as Error)?.message || "Failed to delete path edge");
  }
}
