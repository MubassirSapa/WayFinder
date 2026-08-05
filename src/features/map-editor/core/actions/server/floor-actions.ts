'use server';

import {
  updateFloor as updateFloorPort,
} from "../../services/server/floor.ports";
import type { EditorFloor } from "../../types/map.types";

export async function updateFloor(id: string, data: Partial<EditorFloor>) {
  return updateFloorPort(id, data);
}
