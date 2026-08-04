import type { User } from "@/payload-types";

import {
  createBuildingAdapter,
  createFloorAdapter,
  getBuildingFloorsViewAdapter,
  getBuildingForEditAdapter,
  getFloorForEditAdapter,
  listBuildingsAdapter,
  setFloorStatusAdapter,
  updateBuildingAdapter,
  updateFloorMetadataAdapter,
} from "./buildings-pl.adapter";
import type { TCreateFloor, TSetFloorStatus } from "./buildings-mutations.types";
import type {
  TCreateBuildingInput,
  TUpdateBuildingInput,
  TUpdateFloorMetadataInput,
} from "../../types/buildings.types";

export async function listBuildings(user: User) {
  return listBuildingsAdapter(user);
}

export async function getBuildingFloorsView(user: User, buildingId: string) {
  return getBuildingFloorsViewAdapter(user, buildingId);
}

export async function getBuildingForEdit(user: User, buildingId: string) {
  return getBuildingForEditAdapter(user, buildingId);
}

export async function createBuilding(user: User, input: TCreateBuildingInput) {
  return createBuildingAdapter(user, input);
}

export async function updateBuilding(user: User, buildingId: string, input: TUpdateBuildingInput) {
  return updateBuildingAdapter(user, buildingId, input);
}

export async function getFloorForEdit(user: User, floorId: string) {
  return getFloorForEditAdapter(user, floorId);
}

export async function updateFloorMetadata(user: User, floorId: string, input: TUpdateFloorMetadataInput) {
  return updateFloorMetadataAdapter(user, floorId, input);
}

export async function createFloor(user: User, data: TCreateFloor) {
  return createFloorAdapter(user, data);
}

export async function setFloorStatus(user: User, data: TSetFloorStatus) {
  return setFloorStatusAdapter(user, data);
}
