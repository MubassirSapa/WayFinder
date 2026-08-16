# Caching & rendering strategy (SSG / ISR / SSR)

**Read this in full before changing any `export const dynamic` or adding any
`revalidate`/`revalidatePath`/`revalidateTag` call.** Every recommendation
below was verified by reading the actual data-fetching code for that route,
not assumed. The one fact that matters most is in the box below — skipping
it is how this breaks production.

> ### The critical fact
> **No public page currently revalidates on data change. None.** Grep the
> whole `src/features/*/actions/server/` tree for `revalidatePath` and every
> single call targets a `PRIVATE_ROUTES.*` (dashboard) path — not one
> targets `/`, `/buildings`, or `/map/[floorId]`. Those public pages show
> live data today *only* because they're forced to re-render from scratch
> on every single request (`force-dynamic`, or an inherent dynamic API like
> `searchParams`). If you flip any of them to ISR/SSG **without** also
> adding the revalidation calls listed in this doc, publishing a building,
> editing a floor, or unpublishing a room will silently stop showing up on
> the public site until the cache happens to expire (or forever, if you use
> a static `generateStaticParams` build with no `revalidate` at all). That
> is the failure mode to avoid.

## Current state (verified from the last production build)

| Route | Build mode | Why |
|---|---|---|
| `/` (home) | ƒ Dynamic | `export const dynamic = "force-dynamic"` — explicit opt-out, not inherent |
| `/buildings` (building directory) | ƒ Dynamic | Same — explicit `force-dynamic` |
| `/map/[floorId]` | ƒ Dynamic | **Inherent** — reads `searchParams` (`startObject`/`destObject`/`accessible`), which Next.js always treats as a dynamic API |
| `/map` (no floor id) | ○ Static | No data fetch |
| `/qr/[objectId]` | ƒ Dynamic | Looks up the room's *current* floor and calls `redirect()` — must always be fresh, see below |
| `/about`, `/organization`, `/organization/about`, `/organization/contact`, `/terms`, `/privacy`, `/check-email` | ○ Static | No data fetching at all, already optimal, no action needed |
| `/signin`, `/signup`, `/forgot-password` | ○ Static | No data fetching, no session read |
| `/reset-password`, `/verify-email`, `/invite` | ƒ Dynamic | **Inherent** — read a `searchParams` token, and `/verify-email` + `/invite` perform a real lookup/mutation against a single-use token |
| `/pending-approval` | ƒ Dynamic | **Inherent** — reads the session (`headers()`/`cookies()` via `getCurrentUser()`) to redirect unauthenticated visitors and to look up the signed-in user's organization name |
| `/dashboard/**`, `/editor/[floorId]`, `/admin/**`, `/api/**` | ƒ Dynamic | Per-user/session data or admin tooling — correctly dynamic, out of scope for this doc |

## Per-page recommendation

### `/` and `/buildings` — safe to move to ISR, with revalidation added first

Both call `getPublicLandingData()`
(`src/features/viewer/services/getPublicLandingData.ts`). Verified:

- `overrideAccess: true`, no `headers()`/`cookies()` read anywhere in the
  function — the response is **identical for every visitor**, nothing
  session-specific.
- Reads: `floors` (filtered to `status: "published"`), populated with
  `buildings` (`name`, `address`, `logoUrl`, `organization`) and, through
  that, `organizations` (`name`, `logoUrl`).
- Data-wise this is exactly what ISR is for: public, shared, safe to cache
  across all visitors.

**Collections that must trigger a revalidation of these two pages:**
`floors` (status, name, level, backgroundImageUrl), `buildings` (name,
address, logoUrl), `organizations` (name, logoUrl).

**Recommended change:** replace `export const dynamic = "force-dynamic"`
with `export const revalidate = <N>` (a time-based fallback, e.g. 300s) **and**
add `revalidatePath(PUBLIC_ROUTES.HOME)` +
`revalidatePath(PUBLIC_ROUTES.BUILDINGS)` everywhere a building, floor, or
organization is mutated — see the implementation list below. Time-based
`revalidate` alone (without the explicit calls) is not good enough here:
publishing a floor should show up immediately for the org that just
published it, not after a multi-minute stale window.

### `/map/[floorId]` — data is cache-safe, but the route itself is not (yet)

`getMapViewerData()` (`src/features/map-viewer/services/server/getMapViewerData.ts`)
is equally cache-safe by the same test: `overrideAccess: true`, no session
read, reads `floors`/`map-objects`/`map-nodes`/`path-edges` filtered to
`status: "published"`.

**But the page itself can't be static today** because it reads
`searchParams.startObject`/`destObject`/`accessible` server-side and passes
them as props into `MapViewerShell` → `useApplyRouteFromUrl`
(`src/features/navigation/hooks/useApplyRouteFromUrl.ts`). That hook takes
those values as **props**, not from its own `useSearchParams()` call — so
the server-side `searchParams` read is load-bearing, not redundant, and
can't just be deleted. This is exactly how QR-scan and shared-route links
work (see `docs/technical/ROUTE_URL_STATE.md` and
`docs/technical/QR_WAYFINDING.md`) — don't break that.

**Two real options, not a quick flag flip:**
1. **Leave it dynamic.** Simplest, zero risk. The Payload queries inside it
   are fast (indexed `where: floor.in [...]` lookups), so the actual cost
   of "dynamic" here is one Payload round trip per request, not a full
   page render from nothing.
2. **Refactor to unlock caching**: move the `useApplyRouteFromUrl` call to
   read `useSearchParams()` itself client-side instead of receiving
   `startObjectId`/`destObjectId`/`sharedAccessibleOnly` as server-passed
   props, then the page itself no longer needs `searchParams` and can use
   `export const revalidate = <N>`. This is a real behavior-sensitive code
   change (not just a caching config change) — needs its own testing pass
   against QR scanning and shared-route links specifically before shipping.
   Not recommended as part of a "just add caching" pass.

**If you do pursue option 2 later**, the collections/triggers are the same
as above (`floors`, `map-objects`, `map-nodes`, `path-edges`), and because
this is a parameterized route (`[floorId]`), use
`revalidatePath("/map/[floorId]", "page")` (the literal dynamic-segment
pattern, not one call per floor id) so a single call invalidates every
floor's page at once.

## What must **never** be cached, and why

- **`/qr/[objectId]`** — looks up the room's floor *at request time* and
  redirects there. The entire feature's value proposition (per
  `docs/technical/QR_WAYFINDING.md`) is that a printed sticker survives the
  room moving to a different floor without reprinting. Caching this means a
  moved room's sticker keeps sending people to the old floor.
- **`/verify-email`** — calls `verifyEmailAction(token)`, which **mutates**
  the user's verified status as a side effect of rendering the page. Never
  cache a route that mutates on GET.
- **`/invite`** — calls `getInvitationPreview(token)`, a live lookup against
  a single-use, hashed, expiring token. A cached response could show an
  already-accepted or revoked invite as still valid.
- **`/reset-password`** — token is single-use and per-link by definition;
  there's nothing shared to cache.
- **`/dashboard/**`, `/editor/[floorId]`** — per-user, permission-scoped
  data. Out of scope for public caching entirely.
- **`/pending-approval`** — reads the caller's own session and organization
  name; caching would leak one user's organization name to the next visitor.
- **`/admin/**`, `/api/**`** — Payload's own admin panel and REST/GraphQL
  API. Not part of this strategy.

## Implementation checklist (do this before flipping any `dynamic` export)

1. Add `revalidatePath(PUBLIC_ROUTES.HOME)` and
   `revalidatePath(PUBLIC_ROUTES.BUILDINGS)` to every existing dashboard
   action that already revalidates a building/floor/organization path —
   these already exist and just need the two extra lines each:
   - `src/features/buildings/actions/server/create-building.ts`
   - `src/features/buildings/actions/server/update-building.ts`
   - `src/features/buildings/actions/server/create-floor.ts`
   - `src/features/buildings/actions/server/update-floor-metadata.ts`
   - `src/features/buildings/actions/server/toggle-floor-status.ts` (this
     one matters most — it's literally the publish/unpublish toggle)
   - `src/features/organization-settings/actions/server/update-organization.ts`
   - Any building/floor delete action, if one exists — deleting a
     published floor must also revalidate the public pages.
2. **Also** add the same calls to `afterChange`/`afterDelete` hooks on the
   `floors`, `buildings`, and `organizations` Payload collections
   themselves (`src/collections/map/Floors.ts`, `src/collections/
   Buildings.ts`, `src/collections/Organizations.ts` — note the latter two
   live at the root of `src/collections/`, not under `map/`). Reason: edits
   made directly through `/admin` (the
   Payload admin UI) go through the Local API too, but **skip** the
   dashboard server actions above entirely — hook-level revalidation is the
   only way to cover both entry points. No collection currently does this
   (confirmed — only `cleanupReplacedMedia.ts` exists today), so this is
   new code, not extending something broken.
3. Only after (1) and (2) are in and tested: change
   `export const dynamic = "force-dynamic"` to `export const revalidate = <N>`
   on `/` and `/buildings`.
4. Verify end-to-end before considering this done: publish a floor from the
   dashboard → confirm it appears on `/` and `/buildings` immediately (not
   after N seconds). Then edit the same floor from `/admin` directly →
   confirm the same. Then unpublish it → confirm it disappears from both
   immediately, not just from the dashboard.
5. Leave `/map/[floorId]`, `/qr/[objectId]`, `/verify-email`, `/invite`,
   `/reset-password` exactly as they are unless you're deliberately doing
   the option-2 refactor above with its own dedicated test pass.
