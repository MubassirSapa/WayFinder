// One-time backfill for docs created before Organizations.logoUrl /
// Buildings.logoUrl / Users.avatarUrl existed. createSyncMediaUrlHook only
// runs when its relation field (logo/avatar) is part of an update, so a doc
// that already had a logo/avatar set before this change never got its url
// field populated. This re-saves each such doc's relation field to itself,
// which triggers the hook and fills in the url field.
//
// Run with: node --env-file=.env.local node_modules/payload/bin.js run scripts/backfill-media-urls.ts
// Against production: node --env-file=.env.production node_modules/payload/bin.js run scripts/backfill-media-urls.ts
import { getPayload } from "payload";

import config from "../src/payload.config";
import { relationId } from "../src/lib/payload-id";

async function backfill(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: "organizations" | "buildings" | "users",
  relationField: "logo" | "avatar",
  urlField: "logoUrl" | "avatarUrl",
) {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
  });

  let updated = 0;
  for (const doc of result.docs) {
    const record = doc as unknown as Record<string, unknown>;
    const id = relationId(record[relationField]);
    if (id === null) continue;
    if (typeof record[urlField] === "string" && record[urlField]) continue;

    await payload.update({
      collection,
      id: doc.id,
      overrideAccess: true,
      data: { [relationField]: id },
    });
    updated++;
  }

  console.log(`${collection}: backfilled ${updated} of ${result.docs.length} doc(s)`);
}

async function main() {
  const payload = await getPayload({ config });

  await backfill(payload, "organizations", "logo", "logoUrl");
  await backfill(payload, "buildings", "logo", "logoUrl");
  await backfill(payload, "users", "avatar", "avatarUrl");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
