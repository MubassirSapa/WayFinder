import type { CollectionAfterChangeHook } from "payload";

import { relationId } from "@/lib/payload-id";

/**
 * Deletes the previous media doc (and, via the storage plugin's own
 * afterDelete hook, the real file in R2) when a media relationship field is
 * replaced or cleared. Without this, replacing a logo/avatar/reference image
 * just repoints the relation — the old file is never cleaned up and leaks
 * storage forever.
 *
 * Runs after the change, not before: only delete once the new value has
 * actually been saved, and only because a real change happened (`data`
 * merely including the field with its existing value never reaches here,
 * since `doc`/`previousDoc` would then be equal).
 */
export function createCleanupReplacedMediaHook({
  relationField,
}: {
  relationField: string;
}): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, req }) => {
    // On create, Payload passes previousDoc as `{}` (not undefined) — so the
    // real guard is "was there actually a previous media id", not a
    // truthiness check on previousDoc itself.
    const previousId = relationId((previousDoc as Record<string, unknown>)[relationField]);
    if (previousId === null) {
      return;
    }

    const nextId = relationId((doc as Record<string, unknown>)[relationField]);
    if (String(previousId) === String(nextId)) {
      return;
    }

    try {
      await req.payload.delete({ collection: "media", id: previousId, overrideAccess: true });
    } catch {
      // Already gone (e.g. deleted some other way) — not fatal.
    }
  };
}
