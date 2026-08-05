import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { MEDIA_RESOURCE_FOLDER } from "@/constants/media";
import { uploadMediaClientSide } from "@/lib/uploads/uploadMediaClientSide";

import { useStagedMediaUpload } from "../use-staged-media-upload";

vi.mock("@/lib/uploads/uploadMediaClientSide", () => ({
  uploadMediaClientSide: vi.fn(),
}));

// jsdom doesn't implement the Blob URL registry — stub just enough to
// distinguish real blob urls from the fixed "existing" url used below.
let blobCounter = 0;
beforeAll(() => {
  URL.createObjectURL = vi.fn(() => `blob:mock-${++blobCounter}`);
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

const file = new File(["fake"], "avatar.png", { type: "image/png" });
const existingUrl = "https://cdn.example.com/existing.png";

// The hook takes the <input> ref as an argument instead of returning one
// (see the hook's own comment for why) — a plain object satisfies
// RefObject<HTMLInputElement | null> fine for these tests.
function renderStagedMediaUpload(initialUrl: string | null) {
  const fileInputRef = { current: null };
  return renderHook(() => useStagedMediaUpload(initialUrl, fileInputRef));
}

describe("useStagedMediaUpload", () => {
  it("starts with the given initial url and nothing staged", () => {
    const { result } = renderStagedMediaUpload(existingUrl);

    expect(result.current.previewUrl).toBe(existingUrl);
    expect(result.current.isStaged).toBe(false);
  });

  it("select() creates a local blob preview without uploading anything", () => {
    const { result } = renderStagedMediaUpload(existingUrl);

    act(() => result.current.select(file));

    expect(result.current.previewUrl).toMatch(/^blob:/);
    expect(result.current.isStaged).toBe(true);
    expect(uploadMediaClientSide).not.toHaveBeenCalled();
  });

  it("select() again revokes the previous blob preview", () => {
    const { result } = renderStagedMediaUpload(existingUrl);

    act(() => result.current.select(file));
    const firstBlobUrl = result.current.previewUrl;
    act(() => result.current.select(new File(["fake2"], "avatar2.png", { type: "image/png" })));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(firstBlobUrl);
    expect(result.current.previewUrl).not.toBe(firstBlobUrl);
  });

  it("remove() clears the preview and marks the image as removed", () => {
    const { result } = renderStagedMediaUpload(existingUrl);

    act(() => result.current.remove());

    expect(result.current.previewUrl).toBeNull();
    expect(result.current.isStaged).toBe(false);
  });

  it("reset() discards a staged file and restores the given url", () => {
    const { result } = renderStagedMediaUpload(existingUrl);

    act(() => result.current.select(file));
    act(() => result.current.reset(existingUrl));

    expect(result.current.previewUrl).toBe(existingUrl);
    expect(result.current.isStaged).toBe(false);
  });

  it("resolve() uploads the staged file and returns its id", async () => {
    vi.mocked(uploadMediaClientSide).mockResolvedValue({ id: 42 } as never);
    const { result } = renderStagedMediaUpload(existingUrl);

    act(() => result.current.select(file));
    const resolution = await result.current.resolve({
      data: { alt: "avatar" },
      docPrefix: MEDIA_RESOURCE_FOLDER.USERS,
    });

    expect(uploadMediaClientSide).toHaveBeenCalledWith({
      data: { alt: "avatar" },
      docPrefix: MEDIA_RESOURCE_FOLDER.USERS,
      file,
    });
    expect(resolution).toEqual({ id: "42" });
  });

  it("resolve() returns { id: null } when the image was removed", async () => {
    const { result } = renderStagedMediaUpload(existingUrl);

    act(() => result.current.remove());
    const resolution = await result.current.resolve({ data: {}, docPrefix: MEDIA_RESOURCE_FOLDER.USERS });

    expect(resolution).toEqual({ id: null });
    expect(uploadMediaClientSide).not.toHaveBeenCalled();
  });

  it("resolve() returns undefined when nothing changed", async () => {
    const { result } = renderStagedMediaUpload(existingUrl);

    const resolution = await result.current.resolve({ data: {}, docPrefix: MEDIA_RESOURCE_FOLDER.USERS });

    expect(resolution).toBeUndefined();
  });

  it("settle() clears staged state and adopts the given url without re-uploading", async () => {
    const { result } = renderStagedMediaUpload(existingUrl);

    act(() => result.current.select(file));
    act(() => result.current.settle("https://cdn.example.com/saved.png"));

    expect(result.current.previewUrl).toBe("https://cdn.example.com/saved.png");
    expect(result.current.isStaged).toBe(false);
    const resolution = await result.current.resolve({ data: {}, docPrefix: MEDIA_RESOURCE_FOLDER.USERS });
    expect(resolution).toBeUndefined();
  });
});
