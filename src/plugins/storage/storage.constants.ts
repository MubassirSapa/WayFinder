// Server-only: the environment-scoped storage root. MEDIA_RESOURCE_FOLDER
// (the per-upload subfolder) lives in src/constants/media.ts instead, since
// the client upload helper and every upload form need it too.
//
// No app-name root segment (e.g. "wayfinder/") on top of this — the R2
// bucket itself is already named "way-finder", so a root folder repeating
// that inside the bucket would just be redundant nesting.
export const MEDIA_ENVIRONMENT = {
  PRODUCTION: "prod",
  PREVIEW: "preview",
  LOCAL: "local",
} as const;

export type MediaEnvironment =
  (typeof MEDIA_ENVIRONMENT)[keyof typeof MEDIA_ENVIRONMENT];

// VERCEL_ENV is only set when running on Vercel — a plain `next dev` on a
// local machine never sets it, so that (and anything else unrecognized)
// falls back to "local" rather than accidentally writing under "prod".
function getMediaEnvironment(): MediaEnvironment {
  if (process.env.VERCEL_ENV === "production") {
    return MEDIA_ENVIRONMENT.PRODUCTION;
  }
  if (process.env.VERCEL_ENV === "preview") {
    return MEDIA_ENVIRONMENT.PREVIEW;
  }
  return MEDIA_ENVIRONMENT.LOCAL;
}

// Collection-level static prefix passed to s3Storage() — e.g. "prod".
// Combines with a per-upload MEDIA_RESOURCE_FOLDER via useCompositePrefixes.
export const MEDIA_ROOT_PREFIX = getMediaEnvironment();
