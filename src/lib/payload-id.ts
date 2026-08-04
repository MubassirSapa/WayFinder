import type { Config } from "@/payload-types";

type PayloadCollection = Config["collections"][keyof Config["collections"]];
export type PayloadDocumentId = PayloadCollection extends { id: infer Id } ? Id : never;

/** Convert serialized SQL IDs while preserving string IDs such as MongoDB ObjectIds. */
export function asPayloadId(id: PayloadDocumentId | string): PayloadDocumentId {
  if (typeof id === "string" && /^\d+$/.test(id)) {
    return Number(id) as PayloadDocumentId;
  }

  return id as PayloadDocumentId;
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
