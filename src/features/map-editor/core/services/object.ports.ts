import {
  createMapObjectAdapter,
  updateMapObjectAdapter,
  deleteMapObjectAdapter,
} from "./object-pl.adapter";
import type { EditorMapObject } from "../types/map.types";

export async function createMapObject(
  data: Omit<EditorMapObject, "id" | "_clientId" | "_dirty">,
) {
  return createMapObjectAdapter(data);
}

export async function updateMapObject(id: string, data: Partial<EditorMapObject>) {
  return updateMapObjectAdapter(id, data);
}

export async function deleteMapObject(id: string) {
  return deleteMapObjectAdapter(id);
}
