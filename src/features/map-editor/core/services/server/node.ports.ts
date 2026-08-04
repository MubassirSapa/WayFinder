import {
  createMapNodeAdapter,
  updateMapNodeAdapter,
  deleteMapNodeAdapter,
} from "./node-pl.adapter";
import type { EditorMapNode } from "../../types/map.types";

export async function createMapNode(
  data: Omit<EditorMapNode, "id" | "_clientId" | "_dirty">,
) {
  return createMapNodeAdapter(data);
}

export async function updateMapNode(id: string, data: Partial<EditorMapNode>) {
  return updateMapNodeAdapter(id, data);
}

export async function deleteMapNode(id: string) {
  return deleteMapNodeAdapter(id);
}
