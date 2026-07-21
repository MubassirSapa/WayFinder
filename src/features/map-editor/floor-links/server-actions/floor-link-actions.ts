'use server';

import {
  listLinkableNodes as listLinkableNodesPort,
  listCrossFloorLinks as listCrossFloorLinksPort,
} from "../services/floor-link.ports";

export async function listLinkableNodes(buildingId: string, excludeFloorId: string) {
  return listLinkableNodesPort(buildingId, excludeFloorId);
}

export async function listCrossFloorLinks(buildingId: string) {
  return listCrossFloorLinksPort(buildingId);
}
