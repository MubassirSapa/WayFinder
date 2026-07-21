'use server';

import {
  createPathEdge as createPathEdgePort,
  updatePathEdge as updatePathEdgePort,
  deletePathEdge as deletePathEdgePort,
} from "../../services/server/edge.ports";
import type { EditorPathEdge } from "../../types/map.types";

export async function createPathEdge(
  data: Omit<EditorPathEdge, "id" | "_clientId" | "_dirty">,
) {
  return createPathEdgePort(data);
}

export async function updatePathEdge(id: string, data: Partial<EditorPathEdge>) {
  return updatePathEdgePort(id, data);
}

export async function deletePathEdge(id: string) {
  return deletePathEdgePort(id);
}
