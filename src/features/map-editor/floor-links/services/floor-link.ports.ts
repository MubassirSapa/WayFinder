import {
  listLinkableNodesAdapter,
  listCrossFloorLinksAdapter,
} from "./floor-link-pl.adapter";

export async function listLinkableNodes(buildingId: string, excludeFloorId: string) {
  return listLinkableNodesAdapter(buildingId, excludeFloorId);
}

export async function listCrossFloorLinks(buildingId: string) {
  return listCrossFloorLinksAdapter(buildingId);
}
