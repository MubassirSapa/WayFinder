import {
  getFloorEditorDataAdapter,
  updateFloorAdapter,
} from "./floor-pl.adapter";
import type { EditorFloor } from "../../types/map.types";

export async function getFloorEditorData(floorId: string) {
  return getFloorEditorDataAdapter(floorId);
}

export async function updateFloor(id: string, data: Partial<EditorFloor>) {
  return updateFloorAdapter(id, data);
}
