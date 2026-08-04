# Query Optimization

This document covers two separate ways Payload queries in this codebase were
fetching more than they needed, and what changed for each:

1. **Fetching too many *fields*** — `depth` populating a whole related
   document when a query only reads one or two fields off it. Fixed with
   `select`/`populate`/`defaultPopulate`.
2. **Fetching too many *queries*** — an N+1 pattern, one query per item in a
   loop instead of one batched query for all of them.

The `select`/`populate`/`defaultPopulate` behavior described here is quoted
from Payload's own docs, not inferred — see
[payloadcms.com/docs/queries/select](https://payloadcms.com/docs/queries/select).

## The problem: `depth` fetches whole documents

Payload relationship fields normally store just an ID. Setting `depth` on a
query tells Payload to replace that ID with the full related document instead
— and it does this recursively, one level per unit of `depth`.

```text
depth: 0   floor.building            -> 6                (just the ID)
depth: 1   floor.building            -> { id, name, organization, address,
                                           contactEmail, contactPhone,
                                           website, floorCount, ... }
depth: 2   floor.building.organization -> { id, name, type, ... } as well
```

The problem: most call sites only ever read one or two fields off that
populated document — usually just `name`. Every other field (`address`,
`contactEmail`, `floorCount`, timestamps, ...) was still being fetched from
the database and sent over the wire, on every request, for no reason.

## The four tools, and what each one actually restricts

These are **not** interchangeable ways of doing the same thing — each one
restricts a different document.

| Tool | Restricts | Scope |
| --- | --- | --- |
| `depth` | Nothing by itself — decides *whether* a relationship gets populated into a full document at all, and how many levels deep. | Per query. |
| `select` | The fields of **the collection actually being queried** (`collection: "..."` in `find`/`findByID`) — including that document's own `group`/`array` sub-fields. | Per query. |
| `populate` | The fields of a **related document once `depth` has populated it** — keyed by the *related* collection's slug, not the field name. Overrides that collection's `defaultPopulate` for this one query. | Per query. |
| `defaultPopulate` | Same as `populate`, but it's a collection config property — the fallback used for every query that populates this collection and doesn't pass its own `populate`. | Collection-wide (every caller, unless overridden). |

The distinction that matters: **`select` never reaches into a populated
relationship.** If `floors` has a `building` relationship field, `select:
{ building: true }` on a `floors` query controls whether the `building` key
is present at all (as an ID or populated doc, per `depth`) — it does not
trim *which fields of that populated Building* come back. That's what
`populate`/`defaultPopulate` are for:

```ts
// Local API — restricts what "pages" looks like once populated,
// for this query only, regardless of Pages' own defaultPopulate.
const posts = await payload.find({
  collection: 'posts',
  populate: {
    pages: { text: true },
  },
})
```

`defaultPopulate` and `populate` only affect a collection when it's populated
**as a relationship from another document**. Neither has any effect on a
direct query against that collection itself (e.g. the Payload admin panel
listing buildings, or `payload.find({ collection: "buildings" })`) — a direct
query still returns every field unless *that* query passes its own `select`.

## What was actually fetched vs. what was used

An audit of every `payload.find`/`findByID` call in `src/` and `scripts/`
found five real cases of this pattern — a small part of a related document
read, the whole document fetched:

| Where | What ran | What was actually read |
| --- | --- | --- |
| `collections/map/Floors.ts` `syncFloorCount()` | `payload.find` over every floor in a building, on every floor create/update/delete | `.totalDocs` — none of the fetched rows were used |
| `map-viewer/services/server/getMapViewerData.ts` (public map viewer) | `depth: 2` on every published floor | `building.organization.name` |
| `collections/map/validateBuildingRelationships.ts` (a `beforeValidate` hook on every map-object/node/edge create and update) | `findByID` on the related floor/object/node | `.building` |
| `viewer/services/getPublicLandingData.ts` (public landing page) | `depth: 1` on every published floor | `building.name` |
| `map-editor/floor-links/services/client/floor-link-client.service.ts` | `depth: 1`/`depth: 2` on map-nodes/path-edges | `floor.name`, `floor.level` |

Only one place in the codebase (`getDashboardData.ts`, on its `map-objects`
query) was already using `select` to narrow a query.

## What changed

**1. Count, don't fetch.** `syncFloorCount` used `payload.find(...).totalDocs`
— which still fetches every matching row just to count them. Replaced with
`payload.count(...)`, a dedicated operation that never fetches rows.

```ts
// Before
const floors = await payload.find({ collection: "floors", where, ... });
// floors.totalDocs used, floors.docs discarded

// After
const { totalDocs } = await payload.count({ collection: "floors", where });
```

**2. `select` on the directly-queried document.**
`validateBuildingRelationships.ts` calls `payload.findByID` on the floor/
object/node being referenced — that document *is* the one being queried
(not a populated relation), and only its own `building` field is read.
Added `select: { building: true }`.

**3. `defaultPopulate` on the collections that are populated everywhere else.**
Added to three collections, matching what every current caller actually
reads:

```ts
// collections/Organizations.ts
defaultPopulate: { name: true, type: true }

// collections/Buildings.ts
defaultPopulate: { name: true, organization: true }

// collections/map/Floors.ts
defaultPopulate: { name: true, level: true }
```

Because `Building.defaultPopulate` includes `organization`, and
`Organization` has its own `defaultPopulate`, the trimming applies
recursively — a `depth: 2` floor query now returns:

```json
{
  "building": {
    "id": 6,
    "name": "Harbourfront Galleria",
    "organization": { "id": 6, "name": "Harbourfront Galleria", "type": "mall" }
  }
}
```

instead of the full `Building` document (address, contact fields,
`floorCount`, timestamps) plus the full `Organization` document. This fixed
`getMapViewerData.ts` and `getPublicLandingData.ts` — and every future query
that populates a building or organization — without touching either file.

**4. `select: {}` for an ID-only query.** `accessibleBuildingIds()` in
`collections/access/index.ts` — called on nearly every access-control check
for `owner`/`manager` requests — queries `buildings` directly (not as a
populated relation, so `defaultPopulate` doesn't apply) and only reads `.id`
off each result. `id` isn't a valid key in a generated `*Select` type (Payload
always returns it, `select`-restricted or not), so `select: { id: true }`
doesn't typecheck — but an *empty* include object, `select: {}`, does, and
was confirmed against the live dev database to return only `{ id: 6 }` per
document rather than the full row. Applied there.

This was verified against the running dev database via the Local API
(`payload.find({ collection: "floors", depth: 2, overrideAccess: true })`
for the `defaultPopulate` chain, and `payload.find({ collection: "buildings",
select: {}, overrideAccess: true })` for the empty-select case) before being
written up here, not just assumed from the type definitions.

## Deliberately left alone

- `floor-pl.adapter.ts`'s `depth: 1` for a floor's `backgroundImage` — the
  map editor genuinely uses most of a `Media` document's (small) field set,
  and `Media` has no extra fields beyond upload metadata worth trimming.
- `floor-link-client.service.ts`'s `depth: 2` for cross-floor links
  (`edge -> node -> node.floor`) — the nesting itself is required, not
  wasteful; it now benefits from `Floors.defaultPopulate` automatically.

## Query-count (N+1) issues

A separate pass specifically for "one query per item in a loop instead of
one query for all of them" found two real cases:

**1. `node-pl.adapter.ts` `deleteMapNodeAdapter` — a true N+1.** Deleting a
map node first fetched every path-edge linked to it, then deleted them one at
a time in a sequential loop — 1 + N round trips for a node with N linked
edges:

```ts
// Before
const linkedEdges = await payload.find({ collection: "path-edges", where: {...} });
for (const edge of linkedEdges.docs) {
  await payload.delete({ collection: "path-edges", id: edge.id }); // one at a time
}

// After — a single bulk delete-by-where
await payload.delete({ collection: "path-edges", where: {...} });
```

`payload.delete()` (like `payload.update()`) accepts a `where` instead of an
`id` and deletes every matching document in one call — the same bulk pattern
already used by `seed-demo.ts`'s `clearBuilding` and the buildings-migration
script.

**2. `map-viewer/services/server/getMapViewerData.ts` — 3 queries per floor
instead of 3 total.** Loading a building's map data queried `map-objects`,
`map-nodes`, and `path-edges` separately *for each floor*
(`floors.map(async (floor) => Promise.all([...3 queries scoped to that
floor...]))`) — for a building with N floors, 3N queries (running
concurrently across floors, so not as slow as a true sequential N+1, but
still N times more database round trips than necessary). Replaced with three
queries total, scoped to every floor at once via `where: { floor: { in:
floorIds } } }`, then grouped into the same per-floor shape in memory:

```ts
// Before: one Promise.all([objects, nodes, edges]) per floor
// After: one query per collection, `where: { floor: { in: floorIds } } }`,
// then bucketed by floorId
const objectsByFloorId: Record<string, ViewerMapObject[]> = {};
for (const doc of objectsResult.docs) {
  const object = normalizeObject(doc);
  (objectsByFloorId[object.floorId] ??= []).push(object);
}
```

This also dropped the old per-floor `limit: 1000` cap in favor of
`limit: 0, pagination: false` (fetch everything matching) — the previous cap
applied per floor per collection; multiplying it out to cover every floor in
one query would have meant either an arbitrarily large fixed number or
under-fetching a building with several large floors, so the cap was removed
entirely rather than guessed at. This is the same latent "what happens above
the limit" concern already tracked for the editor in
`docs/technical/MAP_DATA_LOADING_AND_PAGINATION.md`, now also relevant to the
public viewer — real pagination is still the eventual fix for very large
buildings, this change just stops making the problem worse.

Both fixes were verified against the running dev database (a real 2-floor
building's `getMapViewerData` call, confirming distinct non-cross-contaminated
object/node/edge counts per floor) before being written up here.

No sequential `for`/`forEach` loop containing a `payload.*` call remains
anywhere in `src/` outside of one-time `scripts/` (seeding and migration,
where each iteration creates a record with genuinely different data — Payload
has no bulk-create API, so there's no batched alternative there).

## How to verify this yourself

Don't trust field lists or query counts from reading the code — check the
real thing.

### See the actual SQL: `logger: true`

Payload's SQLite adapter is a thin wrapper over Drizzle, which supports a
`logger` option that prints every SQL statement it runs. Temporarily add it
in `src/plugins/database/database.ts`:

```ts
: sqliteAdapter({ client: { url: databaseEnv.url }, logger: true });
```

Then write a one-off script (delete it when done) and run it with `payload
run` — no dev server needed:

```ts
// scripts/verify-query-count.ts
import { getPayload } from "payload";
import config from "../src/payload.config";
import { getMapViewerData } from "../src/features/map-viewer/services/server/getMapViewerData";

const payload = await getPayload({ config });
console.log("--- start ---");
await getMapViewerData("78"); // whatever function/id you're checking
console.log("--- end ---");
await payload.destroy();
```

```bash
npx payload run scripts/verify-query-count.ts
```

Count the `Query:` lines between your markers for the real query count, and
read the `select ...` column lists directly to confirm `select`/
`defaultPopulate` are actually trimming fields — e.g. this is exactly how the
`Buildings`/`Organizations` `defaultPopulate` fix in this document was
confirmed: the logged query was `select "id", "name", "organization_id" from
"buildings"`, not every column. **Always revert `logger: true` afterward** —
it's extremely noisy and shouldn't ship in normal dev output or a commit.

### Browser DevTools Network tab: for anything client-triggered

SQL logging only shows Payload/database queries. Client-triggered work like
the map editor's save flow (`useSaveEditorChanges.ts`) is Next.js Server
Actions — separate HTTP requests from the browser, with no SQL logging
involved at all. Open DevTools → Network, filter to Fetch/XHR, then trigger
the flow:

- **Sequential** (the bug): requests appear one after another in the
  waterfall, each starting only after the previous one finishes.
- **Parallel** (the fix): requests within a phase start at roughly the same
  time (overlapping bars); only distinct phases are staggered.

The same tab is also the simplest way to eyeball response payload *size* for
`select`/`defaultPopulate` changes on a real page load, without needing SQL
logging at all.

### Regression safety

`npx tsc --noEmit && npx eslint src scripts && npx vitest run` catch you
breaking correctness while optimizing — they do **not** catch over-fetching
or N+1 queries by themselves. Use the two methods above for that; use this
for "did I break something while fixing it."

## Checklist for new queries

- Only need an ID off a relation? Use `depth: 0` (the default) and read the
  raw ID — never populate just to immediately discard the object.
- Only need a count? Use `payload.count()`, never `find()` + `.totalDocs`.
- Trimming the fields of **the collection you're directly querying**
  (`collection: "..."` itself, or its own `group`/`array` sub-fields)? Use
  `select` on that query — e.g. `select: { building: true }`,
  `select: {}` for ID-only.
- Trimming the fields of **a related document once `depth` populates it**,
  and *every* caller of that collection wants the same narrow shape? Add
  `defaultPopulate` to the related collection instead of repeating anything
  per-query.
- Only *this one query* needs a different populated shape than the related
  collection's `defaultPopulate` (or it has none and isn't worth adding)?
  Use `populate`, keyed by the related collection's slug — it overrides
  `defaultPopulate` for that query only. Do **not** reach for `select` here;
  `select` cannot restrict a populated relation's fields, only the primary
  document's own.
- Adding `defaultPopulate`/`populate` for a relation that's itself populated
  further (depth ≥ 2)? Check what the *nested* collection's own
  `defaultPopulate` returns too — trimming only stops at the first level
  otherwise.
- About to write a `for`/`.map(async ...)` loop that calls `payload.find`,
  `payload.update`, or `payload.delete` once per item? Stop — `update` and
  `delete` both accept `where` instead of `id` and act on every match in one
  call; `find` with `where: { field: { in: [...] } }` fetches every item's
  data in one call instead of one query per item. A loop is only unavoidable
  when each iteration creates a record with different data (Payload has no
  bulk-create).
