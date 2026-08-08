import type { User } from "@/payload-types";

import { getFloorForQrViewerAdapter } from "./qrFloorViewer-pl.adapter";

export async function getFloorForQrViewer(user: User, floorId: string) {
  return getFloorForQrViewerAdapter(user, floorId);
}
