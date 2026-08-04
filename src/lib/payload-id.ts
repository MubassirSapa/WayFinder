import type { DefaultDocumentIDType } from "payload";

/** Preserve the runtime ID value and let the active Payload adapter cast it. */
export function asPayloadId(id: number | string): DefaultDocumentIDType {
  return id as DefaultDocumentIDType;
}

/** Extract an id from a Payload relationship value, whether populated or not. */
export function relationId(relation: unknown): number | string | null {
  if (relation === null || relation === undefined) return null;
  if (typeof relation === "object" && "id" in relation) {
    const id = (relation as { id: unknown }).id;
    return id === null || id === undefined ? null : (id as number | string);
  }
  return relation as number | string;
}

/** Extract ids from a `hasMany` Payload relationship value, whether populated or not. */
export function relationIds(relation: unknown): (number | string)[] {
  if (!Array.isArray(relation)) return [];
  return relation
    .map(relationId)
    .filter((id): id is number | string => id !== null);
}
