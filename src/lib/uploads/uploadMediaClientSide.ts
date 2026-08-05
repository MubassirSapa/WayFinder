import { payloadSdk } from "@/lib/payload-sdk";
import type { MediaResourceFolder } from "@/constants/media";
import type { Media } from "@/payload-types";

type UploadMediaClientSideArgs = {
  /** Extra fields to save on the media doc itself, e.g. { alt }. */
  data: Record<string, unknown>;
  docPrefix: MediaResourceFolder;
  file: File;
};

type SignedUrlResponse = {
  docPrefix: string;
  filename: string;
  url: string;
};

// Payload's REST error responses are { errors: [{ message }, ...] } — surface
// the real message (e.g. "Exceeded file size limit...") instead of a generic
// one wherever we can, same as Payload's own admin-panel upload handler does.
async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body: { errors?: { message?: string }[] } = await response.json();
    return body.errors?.[0]?.message || fallback;
  } catch {
    return fallback;
  }
}

// A random name instead of the original one: avoids collisions (two people
// naming a file "logo.png"), and sidesteps sanitizing/URL-encoding whatever
// the original name contained — e.g. a real upload during this feature's own
// testing had smart-quote characters in the filename that turned into ugly
// %E2%80%9C sequences in the stored URL.
function toUniqueFilename(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  const extension = lastDot > 0 ? originalName.slice(lastDot).toLowerCase() : "";
  return `${crypto.randomUUID()}${extension}`;
}

// The 3-step direct-to-R2 upload flow Payload's clientUploads feature
// expects (see docs/technical/MEDIA_STORAGE.md) — verified against the
// installed @payloadcms/storage-s3@3.85.1 / payload@3.85.1 source, since
// this exact wire contract isn't documented anywhere. Payload's own admin
// panel does this through internal React context plumbing that only works
// inside Payload's own upload field component, so our app's upload forms
// (which aren't that component) talk to the same two endpoints directly.
export async function uploadMediaClientSide({ data, docPrefix, file }: UploadMediaClientSideArgs): Promise<Media> {
  const signedUrlResponse = await fetch(`${payloadSdk.baseURL}/storage-s3-generate-signed-url`, {
    body: JSON.stringify({
      collectionSlug: "media",
      docPrefix,
      filename: toUniqueFilename(file.name),
      filesize: file.size,
      mimeType: file.type,
    }),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!signedUrlResponse.ok) {
    throw new Error(await readErrorMessage(signedUrlResponse, "Could not start the upload."));
  }

  const { docPrefix: sanitizedDocPrefix, filename: sanitizedFilename, url }: SignedUrlResponse = await signedUrlResponse.json();

  const putResponse = await fetch(url, {
    body: file,
    headers: {
      "Content-Length": String(file.size),
      "Content-Type": file.type,
    },
    method: "PUT",
  });

  if (!putResponse.ok) {
    throw new Error("Upload to storage failed.");
  }

  const form = new FormData();
  // `clientUploadContext.prefix` below only tells Payload where to re-fetch
  // the file's bytes from R2 during this request (see getFilePrefix in
  // @payloadcms/plugin-cloud-storage) — it is NOT copied onto the doc
  // automatically. The doc's own `prefix` field (read later by
  // generateFileURL to build the display URL, and by handleUpload/
  // handleDelete for the storage key) has to be set explicitly here, or it
  // saves as empty and every URL built from it 404s against the real,
  // correctly-prefixed object already sitting in R2. Confirmed by
  // comparing a real uploaded doc's computed url against a HeadObject/List
  // on the actual bucket key.
  form.set("_payload", JSON.stringify({ ...data, prefix: sanitizedDocPrefix }));
  form.set(
    "file",
    JSON.stringify({
      clientUploadContext: { prefix: sanitizedDocPrefix },
      collectionSlug: "media",
      filename: sanitizedFilename,
      mimeType: file.type,
      size: file.size,
    }),
  );

  const createResponse = await fetch(`${payloadSdk.baseURL}/media`, {
    body: form,
    credentials: "include",
    method: "POST",
  });

  if (!createResponse.ok) {
    throw new Error(await readErrorMessage(createResponse, "Could not save the uploaded file."));
  }

  const { doc } = (await createResponse.json()) as { doc: Media };
  return doc;
}
