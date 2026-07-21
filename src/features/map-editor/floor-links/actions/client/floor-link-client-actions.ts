import {
  listLinkableNodesClient,
  listCrossFloorLinksClient,
} from "../../services/client/floor-link-client.service";

export async function listLinkableNodes(buildingId: string, excludeFloorId: string) {
  return listLinkableNodesClient(buildingId, excludeFloorId);
}

export async function listCrossFloorLinks(buildingId: string) {
  return listCrossFloorLinksClient(buildingId);
}
