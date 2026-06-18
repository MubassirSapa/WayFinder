import config from "@payload-config";
import { getPayload, type Payload } from "payload";

declare global {
  var __payloadClientPromise__: Promise<Payload> | undefined;
}

export function getPayloadClient(): Promise<Payload> {
  if (!globalThis.__payloadClientPromise__) {
    globalThis.__payloadClientPromise__ = getPayload({ config });
  }

  return globalThis.__payloadClientPromise__;
}
