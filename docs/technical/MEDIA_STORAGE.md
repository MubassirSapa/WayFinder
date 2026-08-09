# Media Storage (Cloudflare R2 + direct client uploads)

Status: **implemented and live against real R2.** All the code below is
written and passes `tsc`/`eslint`/`vitest`, and real credentials are set in
`.env.local` (bucket `way-finder`, custom domain `cdn.umbrellacorp.cc`) —
`getR2Env().enabled` is `true`, confirmed live. If R2 env vars are ever
unset (e.g. a fresh clone without `.env.local`), the storage plugin falls
back to Payload's default local-disk storage automatically (see
`enabled`/`alwaysInsertFields` below).

## The problem today

Right now, uploading an image (org logo, building logo, avatar, floor
reference image) works like this:

```
Browser  --(sends the whole file)-->  Our server  --(sends the whole file)-->  Disk
```

Two issues:

1. **Size limit.** Our server runs as a Vercel function, and Vercel caps how
   big a request to a function can be (~4.5MB). A bigger image just fails.
2. **Wasted work.** The file passes through our server for no real reason —
   it's just going to end up in storage either way. That's slower and burns
   server time/bandwidth for nothing.

## The fix

Upload straight from the browser to Cloudflare R2 (object storage). Our
server never touches the file bytes — it only ever sends/receives small
JSON messages.

```
Browser  --(1. "I want to upload X")-->        Our server
Browser  <--(2. "ok, upload it here")----      Our server
Browser  --(3. the actual file)--------------> Cloudflare R2   [server not involved]
Browser  --(4. "done, here's the info")-->      Our server  --> saves a small record in the database
```

This is exactly what Payload CMS (the tool this app is built on) calls
**"client uploads"** — a built-in feature for exactly this situation.

## What Cloudflare R2 is

Just cloud file storage (like Dropbox, but for our app's images). It's part
of Cloudflare, S3-compatible (same API shape as Amazon S3, so the tooling
for S3 works with it), and doesn't charge for bandwidth out — which matters
for a map/image-heavy app.

## The 3 steps, in a bit more detail

1. **Get permission to upload.** Browser asks our server "I want to upload
   `logo.png`, it's 200KB, it's a PNG." Our server checks the person is
   logged in, then hands back a special one-time upload link that points
   directly at our R2 bucket. This link expires after 10 minutes.
2. **Upload directly.** Browser sends the file straight to that link. Our
   server is not involved in this step at all — this is the part that fixes
   both problems above.
3. **Save the record.** Browser tells our server "that upload is done,"
   sending only the filename/size/type (not the file itself). Our server
   creates the database row pointing at the file that's now sitting in R2.

We confirmed this exact flow by reading Payload's actual code (their public
docs don't fully explain it), so this isn't a guess.

## How files are organized in the bucket

We won't dump every file into one flat folder, and we won't mix local-dev
test uploads or preview-deploy uploads in with real production files either
— all three point at the same bucket, so the only thing keeping them apart
is the path. Final shape:

```
prod/
  organizations/   <- organization logos
  buildings/        <- building logos
  users/             <- profile avatars
  floors/             <- floor reference images
preview/
  organizations/
  buildings/
  users/
  floors/
local/
  organizations/
  buildings/
  users/
  floors/
```

No app-name root folder on top of this (no `wayfinder/`) — the R2 bucket
itself is already named `way-finder`, so repeating that as a folder inside
its own bucket would just be redundant nesting.

Two segments, each with one job:

1. **`prod` / `preview` / `local`** — which environment produced the
   upload. Decided automatically from Vercel's own `VERCEL_ENV` variable —
   we don't set this by hand per environment, we just read it:
   - `VERCEL_ENV === "production"` → `prod`
   - `VERCEL_ENV === "preview"` → `preview` (this is the literal string
     Vercel sets on preview deployments — not `"prev"`, not `"staging"`)
   - anything else (including plain `next dev` on your own machine, where
     `VERCEL_ENV` isn't set at all) → `local`
2. **`organizations` / `buildings` / `users` / `floors`** — which *kind* of
   upload this is. Picked per upload, not per environment.

### Why this needs one extra config flag most Payload+S3 setups skip

Confirmed by reading the actual installed package source
(`@payloadcms/storage-s3@3.85.1`, `@payloadcms/plugin-cloud-storage@3.85.1`
— published docs don't cover this), not assumed:

- By **default**, Payload's S3 adapter does *not* nest the static prefix
  (`prod`) with the per-upload folder (`buildings`) — the per-upload one
  **replaces** the static one entirely. Turning on `useCompositePrefixes: true`
  (an `s3Storage()` option) is what makes them combine into
  `prod/buildings/...` instead of just `buildings/...`. Without it, this
  whole folder scheme silently doesn't happen.
- The **default public URL** Payload builds also doesn't fit R2 — it
  assumes the shape `{s3-api-endpoint}/{bucket}/{file-path}`, but R2's real
  public URL (the `r2.dev` link or a custom domain) doesn't include the
  bucket name as a path segment and isn't the same address as the private
  S3 API endpoint. So we also need to override how the URL is built
  (`generateFileURL`) and construct it ourselves from `R2_PUBLIC_URL` + the
  file's path, rather than use Payload's default.

### Naming this in code

Const-based, not magic strings, so "which folder does a building logo go
in" is one constant to look up, not a string typed out (and possibly
mistyped) at every call site. Split across two files rather than one,
because they have different audiences:

- **`src/constants/media.ts`** — `MEDIA_RESOURCE_FOLDER` (and
  `MEDIA_MAX_FILE_SIZE_BYTES`). Safe for both client and server code, since
  every upload form (a client component) needs to say which folder its
  upload belongs in.
- **`src/plugins/storage/storage.constants.ts`** — `MEDIA_ENVIRONMENT` and
  `MEDIA_ROOT_PREFIX` (the environment segment, e.g. `"prod"`). Server-only:
  it's read once when building the plugin config, and reading `VERCEL_ENV`
  from a client bundle wouldn't reflect the real deploy environment anyway
  (Next only inlines `NEXT_PUBLIC_`-prefixed env vars into client code).

Each upload call site picks one `MEDIA_RESOURCE_FOLDER` value as the
`docPrefix` it sends when asking for a signed upload URL — e.g. the
building-logo flow always sends `MEDIA_RESOURCE_FOLDER.BUILDINGS`, never a
typed-out `"buildings"` string. Payload combines that with
`MEDIA_ROOT_PREFIX` (because `useCompositePrefixes: true`) into the final
key, inside `src/plugins/storage/storage.ts`.

### One more good pattern worth adopting from your other project

Your reference config's `enabled: r2.enabled` + `alwaysInsertFields: true`
combination is worth copying as-is: when R2 credentials aren't configured
(confirmed from source — this is exactly what `enabled: false` does),
Payload keeps the same DB schema either way and just falls back to storing
files on local disk instead of erroring out. That means local dev works
without needing real R2 credentials at all (only the deployed environments
need them), and nobody has to comment/uncomment config to switch between
"I have R2 set up" and "I don't."

## What you need to set up in Cloudflare

Status: **done.** Bucket `way-finder` exists, the API token and its
Access Key ID / Secret Access Key are set, and `R2_ENDPOINT`/`R2_BUCKET`/
`R2_PUBLIC_URL` (a custom domain, `cdn.umbrellacorp.cc`) are in
`.env.local` — confirmed live: `getR2Env().enabled` is `true`. The
remaining unverified piece is CORS (step 4 below) — check the bucket's
CORS policy allows `PUT` from `http://localhost:3000` if uploads succeed
but something still looks off in the browser.

For reference, what had to be done:

1. **Create an R2 bucket.**
2. **Create an API token** for that bucket (Cloudflare gives you an Access
   Key ID + Secret Access Key, like AWS).
3. **Turn on public access** for the bucket — either:
   - the free `*.r2.dev` link Cloudflare gives you (quick, fine for now), or
   - your own domain (e.g. `cdn.yourapp.com`) pointed at the bucket (better
     long-term, since the URL won't ever need to change).
4. **Allow uploads from our site (CORS).** By default, R2 blocks uploads
   from a browser on a different domain — add a rule allowing `PUT`
   requests from `http://localhost:3000` (for local dev) and the
   production domain.

The 5 env vars the code reads (`getR2Env` in `storage.env.ts`) — it
switches from local disk to R2 automatically the moment all 5 are set, no
code change needed:

| Value | What it is |
| --- | --- |
| `R2_ENDPOINT` | The S3 API endpoint, `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | From the API token |
| `R2_SECRET_ACCESS_KEY` | From the API token |
| `R2_BUCKET` | The bucket name |
| `R2_PUBLIC_URL` | The `r2.dev` link or your custom domain |

## What was built

- **`src/plugins/storage/storage.ts`** — the `s3Storage()` plugin config:
  R2 credentials, `clientUploads: true`, `useCompositePrefixes: true`, and
  a `generateFileURL` override that builds R2's real public URL (see
  above). Falls back to local disk storage if R2 env vars aren't set
  (`enabled`/`alwaysInsertFields`), so local dev works without real
  credentials — this is registered in `payload.config.ts`'s `plugins: []`.
- **`src/plugins/storage/storage.env.ts`** — reads the 5 `R2_*` env vars
  and reports whether R2 is actually configured (`enabled`), unlike the
  `requireXEnv()` helpers this app uses elsewhere, which throw if a value
  is missing — R2 is optional by design.
- **`src/constants/media.ts`** / **`src/plugins/storage/storage.constants.ts`**
  — the folder/path constants (see "Naming this in code" above).
- **`src/lib/uploads/uploadMediaClientSide.ts`** — the shared browser-side
  helper implementing the 3-step flow, reused by every upload form instead
  of each one doing its own thing.
- **`Media.ts`** — `access.create` tightened from open-to-everyone to
  `isLoggedIn`, since upload requests now come from the browser with the
  requester's real session instead of only ever through trusted
  server-side code. A top-level `upload.limits.fileSize` was added to
  **`payload.config.ts`** (not a per-collection option — Payload's
  `UploadConfig` type has no `limits` field; the size cap is a Busboy/body-
  parser option that lives at the config root) — one central 5MB limit
  instead of duplicating a size check in 4 forms; the signed-URL step
  rejects an oversized file before any bytes move.
- The 4 places that used to upload a file (org logo, building logo,
  avatar, floor reference image) got simpler: they stop handling the file
  itself and just receive "here's the ID of the file that's already
  uploaded," then save that ID. The floor reference image flow's old
  dedicated upload endpoint (`uploadFloorReferenceImageAdapter` and its
  port/action wrappers) was deleted rather than kept, since nothing else
  used it once its upload call moved to `uploadMediaClientSide`.
- **`src/hooks/use-staged-media-upload.ts`** — the shared "pick a file now,
  actually upload it later" logic for org logo, building logo, and avatar.
  See "How picking a file works" below for what it does and why.
- **`next.config.ts`** — deliberately **no** `images.remotePatterns` entry
  for the R2 host. Every `<Image>` that renders a Payload/R2 URL sets its
  own `unoptimized` prop instead, which serves the src as-is and never
  goes through Next's `/_next/image` optimizer — adding `remotePatterns`
  would just make it possible for a future `<Image>` to silently start
  routing through that optimizer if someone forgets `unoptimized`, which
  re-adds the exact extra Vercel-function hop this whole change avoids on
  upload. Local static assets (e.g. `WayfinderBrand`'s icon) are
  unaffected and stay optimized, since they don't set `unoptimized`.

## Resolved: logos/avatars don't populate `Media` at all

The original concern here was real: when one record points at another
(e.g. a building points at its logo), Payload by default pulls the *entire*
linked record, not just the `url` a page actually needs — and restricting a
populated `media` doc to just `{ url: true }` silently returns `url: null`,
since Payload computes `url` at read time from the doc's other upload
fields.

Rather than trimming a populated `Media` doc, the fix that shipped avoids
populating it at all: `Organizations.logoUrl`, `Buildings.logoUrl`, and
`Users.avatarUrl` are plain string fields, denormalized from the `logo`/
`avatar` relation by `createSyncMediaUrlHook`
(`src/collections/hooks/syncMediaUrl.ts`) on `beforeValidate` every time the
relation changes. Every logo/avatar read site reads that string field
directly — no `depth`/`populate` override into `media` is needed, and the
`url: null` populate-restriction trap above never comes up for these
fields. `Media.ts` itself still has no `defaultPopulate` — that's
deliberate now, not an open TODO, since nothing needs it to populate
`media` anymore. See `docs/technical/QUERY_OPTIMIZATION.md` and
`docs/project/SCHEMA.md` for the full field-by-field picture.

## How picking a file works: stage locally, upload on Save

Picking a file never uploads anything by itself. It only creates a local
`blob:` preview (via `URL.createObjectURL`) so you can see what you picked
— no network request yet. The real upload happens once, as the first step
of the form's own submit, so a form the user never saves never uploads (or
orphans-then-deletes, per `createCleanupReplacedMediaHook`) a file at all.

This is shared logic, not copy-pasted per form: **`src/hooks/use-staged-media-upload.ts`**
(`useStagedMediaUpload`), used by `OrganizationForm.tsx`, `BuildingForm.tsx`,
and `ProfileForm.tsx`/`ProfilePhotoEditor.tsx`. It owns the staged
`File`/blob-preview state and exposes:

- `select(file)` — stage a new file, replacing any previous blob preview.
- `remove()` — clear the image (marks it for removal on save).
- `reset(url)` — discard staging and go back to a given url (used by "Cancel").
- `resolve({ docPrefix, data })` — call as the first step of submit; uploads
  the staged file if there is one and returns what to send the server
  action (`{ id }`, `{ id: null }` for a removal, or `undefined` if nothing
  changed at all). Throws if the upload fails, same as a failed save.
- `settle(url)` — call after a successful save with the server's real url,
  to clear staged state without re-uploading.

The `<input type="file">` ref is owned by the calling component (a plain
local `useRef`, passed into the hook) rather than returned from the hook —
a hook returning a ref alongside plain reactive state trips
`eslint-plugin-react-hooks`'s stricter "refs"/"immutability" rules, which
taint *every* property read off the same returned object once any of them
touches a ref, even properties that aren't the ref.

The floor reference image flow (`FloorReferencePanel.tsx`) doesn't use this
hook — its "current" image is read live from the map editor's Zustand store
(`floor.backgroundImageUrl`), not local component state, since switching
floors while the panel is mounted needs to show the new floor's image
immediately; routing that through a hook that owns "the current value" as
local state would either break on floor-switch or need extra sync-effect
plumbing for no real gain. It already staged-then-uploaded before this
change (picking a file only sets local state; the explicit "Upload"/
"Replace" button triggers the real upload) — it just gained its own local
blob preview and an always-visible image slot (a placeholder icon when
empty, matching the other 3 forms) as part of this pass.

## How we'll verify it works

Upload a logo, open the browser's Network tab, and confirm the file upload
goes straight to the R2 domain — not to our app's server at all. Then
confirm the image shows up correctly on the page.

**One real bug already found and fixed this way**: the first live upload
succeeded (the `PUT` went straight to R2), but the image didn't render
afterward. Comparing the media doc's computed `url` against what was
actually sitting in the bucket (via `HeadObject`/`ListObjectsV2` with the
same credentials) showed the doc's `prefix` field had saved as empty, even
though the file itself uploaded to the correct, fully-prefixed key. Root
cause: `clientUploadContext.prefix` (sent in step 3) only tells Payload
where to re-fetch the file's bytes *during that same request* — it is not
copied onto the doc's own `prefix` field automatically. The doc's `prefix`
has to be set explicitly as part of the saved data, or every URL later
built from it (via `generateFileURL`) points at the wrong key. Fixed in
`uploadMediaClientSide.ts`.
