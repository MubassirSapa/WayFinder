import { getPayloadClient } from "@/lib/getPayloadClient";
import { asPayloadId, relationId } from "@/lib/payload-id";

// Backing the /qr/{objectId} resolver route: a public, anonymous read (a
// scanned sticker has no signed-in user), so overrideAccess: true is
// correct here, same as getMapViewerData's public reads. Returns the
// object's *current* floor so a printed sticker survives that room moving
// floors later - see docs/technical/QR_WAYFINDING.md's "Why a shared route
// link skips the /qr/{objectId} indirection" for why only this, permanent-
// sticker path needs the resolver hop at all.
export async function getObjectFloorIdAdapter(objectId: string): Promise<string | null> {
  const payload = await getPayloadClient();

  const object = await payload
    .findByID({
      id: asPayloadId(objectId),
      collection: "map-objects",
      depth: 0,
      overrideAccess: true,
      select: { floor: true },
    })
    .catch(() => null);

  const floorId = relationId(object?.floor);
  return floorId === null ? null : String(floorId);
}
