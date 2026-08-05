# Media Storage (Cloudflare R2 + direct client uploads)

Status: **planned, not implemented yet.** This doc describes the design we
agreed on. No code has been changed.

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

We won't dump every file into one flat folder. Payload already has a
built-in way to do this (a "prefix"), so we don't need to build anything
custom for it — we just configure it:

```
wayfinder/
  organizations/   <- organization logos
  buildings/        <- building logos
  users/             <- profile avatars
  floors/             <- floor reference images
```

- `wayfinder` is set once, in config, as the root folder for everything this
  app stores.
- `organizations` / `buildings` / `users` / `floors` is picked per upload,
  based on what's being uploaded — our shared upload helper (see below)
  will say "this one goes in `buildings`" and Payload places it there
  automatically.

## What you need to set up in Cloudflare

Before any of this can work, you need to:

1. **Create an R2 bucket** (e.g. `wayfinder-media`).
2. **Create an API token** for that bucket (Cloudflare gives you an Access
   Key ID + Secret Access Key, like AWS).
3. **Turn on public access** for the bucket — either:
   - the free `*.r2.dev` link Cloudflare gives you (quick, fine for now), or
   - your own domain (e.g. `cdn.yourapp.com`) pointed at the bucket (better
     long-term, since the URL won't ever need to change).
4. **Allow uploads from our site (CORS).** By default, R2 blocks uploads
   from a browser on a different domain — you need to add a rule allowing
   `PUT` requests from `http://localhost:3000` (for local dev) and your
   production domain.

Once that's done, give me these 5 values and I'll wire up the code:

| Value | What it is |
| --- | --- |
| `R2_ACCOUNT_ID` | Your Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | From the API token |
| `R2_SECRET_ACCESS_KEY` | From the API token |
| `R2_BUCKET` | The bucket name |
| `R2_PUBLIC_URL` | The `r2.dev` link or your custom domain |

## What changes in the code (once we have the values above)

- One small config file that tells Payload "store files in R2, allow direct
  uploads, and use `wayfinder` as the root folder."
- One shared helper that does the 3-step upload from the browser — reused
  by every upload form instead of each one doing its own thing. It also
  says which subfolder (`organizations`, `buildings`, `users`, `floors`)
  each upload belongs in.
- The 4 places that currently upload a file (org logo, building logo,
  avatar, floor reference image) get simpler: they stop handling the file
  itself and just receive "here's the ID of the file that's already
  uploaded," then save that ID.
- A small tweak so images load directly from R2 instead of also being
  routed through Next.js's own image-resizing step — same reasoning as
  above, one less unnecessary hop.

## Follow-up: trim what gets fetched when a logo/avatar loads

We already ran into this exact issue with `Organizations`, `Buildings`, and
`Floors` — see `docs/technical/QUERY_OPTIMIZATION.md`. When one record
points at another (e.g. a building points at its logo), Payload by default
pulls the *entire* linked record, not just the parts we actually use.

`Media` doesn't have this trimming set up yet, because logos/avatars didn't
exist when that earlier pass was done. Once uploads are wired up, every
place that shows a building's logo (or a user's avatar) will be pulling
back the full `media` record — filename, mime type, file size, alt text,
timestamps — when really the page almost always only needs the `url`.

Fix (small, do it alongside this work, not urgent but easy to forget):
add a `defaultPopulate` to `Media.ts` that only includes `url` (and `alt`
where it's actually shown), the same way `Organizations.ts`/`Buildings.ts`/
`Floors.ts` already do.

**One catch, confirmed by testing it live**: restricting a populated media
doc to just `{ url: true }` (via a per-query `populate` override) silently
returns `url: null` instead of the real URL. Payload computes `url` at read
time from the doc's other upload fields (at least `filename`), so trimming
those away breaks the very field we wanted to keep. Whatever field set ends
up in `Media`'s `defaultPopulate` needs to include enough for that
computation to still work — verify it against a real record before trusting
it, the same way this note itself was confirmed rather than assumed.

## One UX change worth knowing about

Today, picking a file just previews it locally — the actual upload happens
when you hit "Save." With direct uploads, it makes more sense to upload
**as soon as you pick the file** (so you get a real preview from the real
uploaded image, not a temporary local one), and "Save" just attaches the
already-uploaded file. Small change, but worth knowing before it happens.

## How we'll verify it works

Once it's built: upload a logo, open the browser's Network tab, and confirm
the file upload goes straight to the R2 domain — not to our app's server at
all. Then confirm the image shows up correctly on the page.
