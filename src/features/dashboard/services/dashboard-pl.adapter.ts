import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import { NEW_FLOOR_DEFAULTS } from "@/features/dashboard/constants/dashboard.constants";
import type { TCreateFloor, TSetFloorStatus } from "./dashboard.types";

async function getPayloadClient() {
  return getPayload({ config });
}

export async function createFloorAdapter(data: TCreateFloor) {
  const payload = await getPayloadClient();

  return tryCatchResponse(() =>
    payload.create({
      collection: "floors",
      overrideAccess: true,
      data: {
        buildingId: data.buildingId,
        name: data.name,
        level: data.level,
        width: NEW_FLOOR_DEFAULTS.width,
        height: NEW_FLOOR_DEFAULTS.height,
        status: data.publish ? "published" : "draft",
      },
    }),
  );
}

export async function setFloorStatusAdapter({ id, status }: TSetFloorStatus) {
  const payload = await getPayloadClient();

  return tryCatchResponse(() =>
    payload.update({
      collection: "floors",
      id,
      overrideAccess: true,
      data: { status },
    }),
  );
}
