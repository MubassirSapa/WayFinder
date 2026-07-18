'use server';

import config from "@payload-config";
import type { Floor, MapNode as PayloadMapNode, PathEdge as PayloadPathEdge } from "@/payload-types";
import { getPayload } from "payload";

import type { CrossFloorLink, LinkableFloorLinkNode } from "../types/floorLink.types";

async function getPayloadClient() {
  return getPayload({ config });
}

export async function listLinkableNodes(
  buildingId: string,
  excludeFloorId: string,
): Promise<LinkableFloorLinkNode[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "map-nodes",
    depth: 1,
    limit: 500,
    overrideAccess: true,
    where: {
      and: [
        { buildingId: { equals: buildingId } },
        { role: { in: ["stairs_entry", "elevator_entry"] } },
        { floor: { not_equals: Number(excludeFloorId) } },
      ],
    },
  });

  return result.docs.map((doc) => {
    const node = doc as PayloadMapNode;
    const floor = node.floor as Floor;

    return {
      buildingId: node.buildingId,
      floorId: String(floor.id),
      floorLevel: floor.level ?? 0,
      floorName: floor.name,
      id: String(node.id),
      isAccessible: node.isAccessible ?? true,
      label: node.label ?? "",
      role: node.role as "stairs_entry" | "elevator_entry",
      x: node.x,
      y: node.y,
    };
  });
}

export async function listCrossFloorLinks(buildingId: string): Promise<CrossFloorLink[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "path-edges",
    // depth 2: edge -> node -> node.floor, so floor names are resolved
    // without a second round trip.
    depth: 2,
    limit: 500,
    overrideAccess: true,
    where: {
      and: [
        { buildingId: { equals: buildingId } },
        { type: { in: ["stairs", "elevator"] } },
      ],
    },
  });

  return result.docs.map((doc) => {
    const edge = doc as PayloadPathEdge;
    const fromNode = edge.fromNode as PayloadMapNode;
    const toNode = edge.toNode as PayloadMapNode;
    const fromFloor = fromNode.floor as Floor;
    const toFloor = toNode.floor as Floor;

    return {
      distanceMeters: edge.distanceMeters ?? 0,
      fromFloorName: fromFloor.name,
      fromNodeId: String(fromNode.id),
      fromNodeLabel: fromNode.label || fromNode.role,
      id: String(edge.id),
      toFloorName: toFloor.name,
      toNodeId: String(toNode.id),
      toNodeLabel: toNode.label || toNode.role,
      type: edge.type as "stairs" | "elevator",
    };
  });
}
