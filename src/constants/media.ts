// Which folder a client-uploaded file belongs in (sent as `docPrefix` when
// requesting a signed upload URL — see uploadMediaClientSide). Shared across
// every upload flow and the storage plugin config, so it lives at the root
// rather than inside one feature.
export const MEDIA_RESOURCE_FOLDER = {
  ORGANIZATIONS: "organizations",
  BUILDINGS: "buildings",
  USERS: "users",
  FLOORS: "floors",
} as const;

export type MediaResourceFolder = (typeof MEDIA_RESOURCE_FOLDER)[keyof typeof MEDIA_RESOURCE_FOLDER];

// One central limit instead of duplicating a size check in every upload
// form — the signed-URL step (src/plugins/storage/storage.ts) rejects an
// oversized file before any bytes move, and payload.config.ts's top-level
// `upload.limits.fileSize` enforces the same value server-side.
export const MEDIA_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
