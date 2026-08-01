import type { DefaultDocumentIDType } from "payload";

/** Preserve the runtime ID value and let the active Payload adapter cast it. */
export function asPayloadId(id: number | string): DefaultDocumentIDType {
  return id as DefaultDocumentIDType;
}
