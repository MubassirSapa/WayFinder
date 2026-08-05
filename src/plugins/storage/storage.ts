import { s3Storage } from "@payloadcms/storage-s3";

import { getR2Env } from "./storage.env";
import { MEDIA_ROOT_PREFIX } from "./storage.constants";

const r2 = getR2Env();

// Payload's default public-URL builder assumes {s3-api-endpoint}/{bucket}/{key},
// which isn't R2's real public URL shape (r2.dev or a custom domain, no bucket
// segment, different host than the S3 API endpoint) — confirmed against
// @payloadcms/storage-s3@3.85.1 source, not assumed. So this builds the URL
// ourselves from R2_PUBLIC_URL instead of letting the adapter do it.
//
// `prefix` here is only the per-upload docPrefix (e.g. "buildings") — with
// useCompositePrefixes on, the collection-level MEDIA_ROOT_PREFIX is applied
// separately by the adapter for the actual storage key, but generateFileURL
// only receives the doc-level segment, so it has to be prepended by hand.
function generateFileURL({ filename, prefix }: { filename: string; prefix?: string }) {
  const baseUrl = r2.publicUrl.replace(/\/+$/, "");
  const key = [MEDIA_ROOT_PREFIX, prefix, filename].filter(Boolean).join("/");

  return `${baseUrl}/${key}`;
}

export const r2StoragePlugin = s3Storage({
  enabled: r2.enabled,
  alwaysInsertFields: true,
  clientUploads: true,
  useCompositePrefixes: true,
  bucket: r2.enabled ? r2.bucket : "",
  collections: {
    media: {
      prefix: MEDIA_ROOT_PREFIX,
      disablePayloadAccessControl: true,
      generateFileURL,
    },
  },
  config: {
    region: "auto",
    endpoint: r2.enabled ? r2.endpoint : "",
    forcePathStyle: true,
    credentials: {
      accessKeyId: r2.enabled ? r2.accessKeyId : "",
      secretAccessKey: r2.enabled ? r2.secretAccessKey : "",
    },
  },
});
