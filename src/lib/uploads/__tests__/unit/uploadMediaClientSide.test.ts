import { afterEach, describe, expect, it, vi } from "vitest";

import { MEDIA_RESOURCE_FOLDER } from "@/constants/media";
import { payloadSdk } from "@/lib/payload-sdk";
import { uploadMediaClientSide } from "@/lib/uploads/uploadMediaClientSide";

function jsonResponse(body: unknown, ok = true) {
  return {
    json: async () => body,
    ok,
  } as Response;
}

const file = new File(["fake-image-bytes"], "logo.png", { type: "image/png" });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("uploadMediaClientSide", () => {
  it("performs the signed-url, direct-upload, and doc-create steps in order and returns the created doc", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ docPrefix: "buildings", filename: "logo-1.png", url: "https://r2.example.com/signed-put" }),
      )
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce(jsonResponse({ doc: { id: 42, alt: "Acme logo", url: "https://cdn.example.com/logo-1.png" } }));

    const result = await uploadMediaClientSide({
      data: { alt: "Acme logo" },
      docPrefix: MEDIA_RESOURCE_FOLDER.BUILDINGS,
      file,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ id: 42, alt: "Acme logo", url: "https://cdn.example.com/logo-1.png" });

    // Step 1: ask for a signed URL with the raw docPrefix, not the environment
    // root, and a randomized filename instead of the original one (avoids
    // collisions and sidesteps sanitizing whatever the original name held).
    const [signedUrlArgs, signedUrlInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(signedUrlArgs).toBe(`${payloadSdk.baseURL}/storage-s3-generate-signed-url`);
    expect(signedUrlInit.credentials).toBe("include");
    const signedUrlBody = JSON.parse(signedUrlInit.body as string);
    expect(signedUrlBody).toMatchObject({
      collectionSlug: "media",
      docPrefix: "buildings",
      filesize: file.size,
      mimeType: "image/png",
    });
    expect(signedUrlBody.filename).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(signedUrlBody.filename).not.toBe(file.name);

    // Step 2: PUT the raw file straight to the signed URL, no credentials/headers meant for our own API.
    const [putUrl, putInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(putUrl).toBe("https://r2.example.com/signed-put");
    expect(putInit.method).toBe("PUT");
    expect(putInit.body).toBe(file);

    // Step 3: create the doc. The sanitized docPrefix has to travel two
    // separate ways here — as clientUploadContext.prefix (so the server can
    // re-fetch the file's bytes from R2 during this request) and as the
    // doc's own `prefix` field in _payload (so the saved doc — and every
    // URL later built from it via generateFileURL — actually records where
    // the file lives; clientUploadContext is not copied onto the doc
    // automatically).
    const [createUrl, createInit] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(createUrl).toBe(`${payloadSdk.baseURL}/media`);
    const form = createInit.body as FormData;
    expect(JSON.parse(form.get("_payload") as string)).toEqual({ alt: "Acme logo", prefix: "buildings" });
    expect(JSON.parse(form.get("file") as string)).toEqual({
      clientUploadContext: { prefix: "buildings" },
      collectionSlug: "media",
      filename: "logo-1.png",
      mimeType: "image/png",
      size: file.size,
    });
  });

  it("throws the server's real error message when the signed-url request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({ errors: [{ message: "Exceeded file size limit. Limit: 5.00MB, got: 8.00MB" }] }, false),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      uploadMediaClientSide({ data: {}, docPrefix: MEDIA_RESOURCE_FOLDER.USERS, file }),
    ).rejects.toThrow("Exceeded file size limit. Limit: 5.00MB, got: 8.00MB");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when the direct upload to storage fails, without attempting to create a doc", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ docPrefix: "users", filename: "avatar.png", url: "https://r2.example.com/signed-put" }))
      .mockResolvedValueOnce({ ok: false } as Response);

    await expect(
      uploadMediaClientSide({ data: {}, docPrefix: MEDIA_RESOURCE_FOLDER.USERS, file }),
    ).rejects.toThrow("Upload to storage failed.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to a generic message when the create step fails without a parseable error body", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ docPrefix: "floors", filename: "plan.png", url: "https://r2.example.com/signed-put" }))
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: false, json: async () => { throw new Error("not json"); } } as unknown as Response);

    await expect(
      uploadMediaClientSide({ data: {}, docPrefix: MEDIA_RESOURCE_FOLDER.FLOORS, file }),
    ).rejects.toThrow("Could not save the uploaded file.");
  });
});
