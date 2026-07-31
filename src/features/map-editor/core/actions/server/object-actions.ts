'use server';

import {
  createMapObject as createMapObjectPort,
  updateMapObject as updateMapObjectPort,
  deleteMapObject as deleteMapObjectPort,
} from "../../services/server/object.ports";
import type { EditorMapObject } from "../../types/map.types";

export async function createMapObject(
  data: Omit<EditorMapObject, "id" | "_clientId" | "_dirty">,
) {
  return createMapObjectPort(data);
}

export async function updateMapObject(id: string, data: Partial<EditorMapObject>) {
  return updateMapObjectPort(id, data);
}

export async function deleteMapObject(id: string) {
  return deleteMapObjectPort(id);
}
