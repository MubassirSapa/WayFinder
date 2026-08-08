import { getObjectFloorIdAdapter } from "./objectFloorLookup-pl.adapter";

export async function getObjectFloorId(objectId: string) {
  return getObjectFloorIdAdapter(objectId);
}
