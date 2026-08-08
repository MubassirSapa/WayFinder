import type { User } from "@/payload-types";
import { getPayloadClient } from "@/lib/getPayloadClient";
import { asPayloadId } from "@/lib/payload-id";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";

import {
  normalizeEdge,
  normalizeFloor,
  normalizeNode,
  normalizeObject,
} from "@/features/map-viewer/services/server/getMapViewerData";
import type { MapViewerData } from "@/features/map-viewer/types/map-viewer.types";

// Admin-scoped counterpart to getMapViewerData: same MapViewerData shape (so
// MapViewerSvg/MapViewerCanvas need zero adaptation), but for exactly one
// floor, gated by the real signed-in user's own access instead of
// overrideAccess: true, and with no `status: "published"` filter - an admin
// generating QR stickers needs this to work on a floor before it goes live
// too. See docs/technical/DASHBOARD_QR_VIEWER.md.
export async function getFloorForQrViewerAdapter(user: User, floorId: string) {
  return tryCatchResponse<MapViewerData>(async () => {
    const payload = await getPayloadClient();
    const id = asPayloadId(floorId);

    const floorDoc = await payload.findByID({
      collection: "floors",
      id,
      // depth 2: floor -> building -> building.organization, same as the
      // public loader, so organizationName resolves without a second query.
      depth: 2,
      overrideAccess: false,
      user,
    });

    const floor = normalizeFloor(floorDoc);

    const [objectsResult, nodesResult, edgesResult] = await Promise.all([
      payload.find({
        collection: "map-objects",
        depth: 0,
        limit: 0,
        pagination: false,
        overrideAccess: false,
        sort: "name",
        user,
        where: { floor: { equals: id } },
      }),
      payload.find({
        collection: "map-nodes",
        depth: 0,
        limit: 0,
        pagination: false,
        overrideAccess: false,
        user,
        where: { floor: { equals: id } },
      }),
      payload.find({
        collection: "path-edges",
        depth: 0,
        limit: 0,
        pagination: false,
        overrideAccess: false,
        user,
        where: { floor: { equals: id } },
      }),
    ]);

    return {
      edgesByFloorId: { [floor.id]: edgesResult.docs.map((doc) => normalizeEdge(doc)) },
      floors: [floor],
      initialFloorId: floor.id,
      nodesByFloorId: { [floor.id]: nodesResult.docs.map((doc) => normalizeNode(doc)) },
      objectsByFloorId: { [floor.id]: objectsResult.docs.map((doc) => normalizeObject(doc)) },
    };
  });
}
