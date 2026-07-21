import {
  createPathEdgeAdapter,
  updatePathEdgeAdapter,
  deletePathEdgeAdapter,
} from "./edge-pl.adapter";
import type { EditorPathEdge } from "../types/map.types";

export async function createPathEdge(
  data: Omit<EditorPathEdge, "id" | "_clientId" | "_dirty">,
) {
  return createPathEdgeAdapter(data);
}

export async function updatePathEdge(id: string, data: Partial<EditorPathEdge>) {
  return updatePathEdgeAdapter(id, data);
}

export async function deletePathEdge(id: string) {
  return deletePathEdgeAdapter(id);
}
