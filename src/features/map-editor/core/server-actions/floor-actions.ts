'use server';

import {
  getFloorEditorData as getFloorEditorDataPort,
  updateFloor as updateFloorPort,
  uploadFloorReferenceImage as uploadFloorReferenceImagePort,
} from "../services/floor.ports";
import type { EditorFloor } from "../types/map.types";

export async function getFloorEditorData(floorId: string) {
  return getFloorEditorDataPort(floorId);
}

export async function updateFloor(id: string, data: Partial<EditorFloor>) {
  return updateFloorPort(id, data);
}

export async function uploadFloorReferenceImage(formData: FormData) {
  return uploadFloorReferenceImagePort(formData);
}
