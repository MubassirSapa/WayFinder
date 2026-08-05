import type { CollectionBeforeValidateHook } from "payload";

import { relationId } from "@/lib/payload-id";

/**
 * Denormalizes a `media` relationship's `url` onto a plain text field on the
 * same doc (e.g. `logo` -> `logoUrl`), computed once here at write time.
 *
 * This exists so reading a building/organization/user's logo or avatar never
 * needs to populate the `media` relation at all — no `depth`, no `populate`
 * override, and none of the "populate restricted to `{ url: true }` silently
 * returns `url: null`" trap documented in docs/technical/MEDIA_STORAGE.md,
 * since Media.url is computed from other upload fields at read time and a
 * plain string field has no such computation to break.
 *
 * Only runs when `relationField` is actually part of this update — Payload's
 * beforeValidate `data` is a partial, so an update that doesn't touch the
 * relation leaves the existing url field untouched instead of needing a
 * redundant lookup.
 */
export function createSyncMediaUrlHook({
  relationField,
  urlField,
}: {
  relationField: string;
  urlField: string;
}): CollectionBeforeValidateHook {
  return async ({ data, req }) => {
    if (!data || !(relationField in data)) {
      return data;
    }

    const relation = data[relationField];

    if (relation === null) {
      return { ...data, [urlField]: null };
    }

    if (typeof relation === "object" && "url" in relation) {
      return { ...data, [urlField]: typeof relation.url === "string" ? relation.url : null };
    }

    const id = relationId(relation);
    if (id === null) {
      return { ...data, [urlField]: null };
    }

    const media = await req.payload.findByID({
      collection: "media",
      id,
      depth: 0,
      overrideAccess: true,
    });

    return { ...data, [urlField]: typeof media.url === "string" ? media.url : null };
  };
}
