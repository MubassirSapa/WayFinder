'use server';

import {
  createMapNode as createMapNodePort,
  updateMapNode as updateMapNodePort,
  deleteMapNode as deleteMapNodePort,
} from "../../services/server/node.ports";
import type { EditorMapNode } from "../../types/map.types";

export async function createMapNode(
  data: Omit<EditorMapNode, "id" | "_clientId" | "_dirty">,
) {
  return createMapNodePort(data);
}

export async function updateMapNode(id: string, data: Partial<EditorMapNode>) {
  return updateMapNodePort(id, data);
}

export async function deleteMapNode(id: string) {
  return deleteMapNodePort(id);
}
