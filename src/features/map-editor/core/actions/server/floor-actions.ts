'use server';

import {
  updateFloor as updateFloorPort,
  uploadFloorReferenceImage as uploadFloorReferenceImagePort,
} from "../../services/server/floor.ports";
import type { EditorFloor } from "../../types/map.types";

export async function updateFloor(id: string, data: Partial<EditorFloor>) {
  return updateFloorPort(id, data);
}

export async function uploadFloorReferenceImage(formData: FormData) {
  return uploadFloorReferenceImagePort(formData);
}
