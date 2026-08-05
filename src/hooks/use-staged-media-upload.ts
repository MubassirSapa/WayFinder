"use client";

import { useState } from "react";
import type { RefObject } from "react";

import type { MediaResourceFolder } from "@/constants/media";
import { uploadMediaClientSide } from "@/lib/uploads/uploadMediaClientSide";

// Shared by every logo/avatar/image form: picking a file only stages it
// locally (a blob: preview, no network call) — the real upload happens once
// inside `resolve()`, which callers run as the first step of their own
// submit handler. This mirrors how the app behaved before direct-to-R2
// uploads existed, and avoids uploading (and now, per
// createCleanupReplacedMediaHook, immediately orphaning-then-deleting) a
// file for a form the user never actually saves.
//
// The caller owns the `<input type="file">` ref (a plain local `useRef` in
// the component, passed in here) rather than this hook returning one itself
// — a hook returning a ref alongside plain state trips eslint-plugin-react-
// hooks' stricter "refs"/"immutability" rules, which taint *every* property
// read off the same returned object once any of them touches a ref.
//
// File-type validation is deliberately NOT done here — each form already
// has its own localized error copy and error-display state, so callers
// validate before calling `select`.
export function useStagedMediaUpload(initialUrl: string | null, fileInputRef: RefObject<HTMLInputElement | null>) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [removed, setRemoved] = useState(false);

  const revokePreview = (url: string | null) => {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  };

  const clearFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  function select(nextFile: File) {
    setPreviewUrl((current) => {
      revokePreview(current);
      return URL.createObjectURL(nextFile);
    });
    setFile(nextFile);
    setRemoved(false);
    clearFileInput();
  }

  function remove() {
    setPreviewUrl((current) => {
      revokePreview(current);
      return null;
    });
    setFile(null);
    setRemoved(true);
    clearFileInput();
  }

  /** Discard any staged file and go back to the given (usually the original) url — used by "Cancel". */
  function reset(url: string | null) {
    setPreviewUrl((current) => {
      revokePreview(current);
      return url;
    });
    setFile(null);
    setRemoved(false);
    clearFileInput();
  }

  /**
   * Call as the first step of submit. Uploads the staged file (if any) and
   * returns what to send the server action:
   * - `{ id: string }` — a new file was staged, upload succeeded.
   * - `{ id: null }` — the image was removed.
   * - `undefined` — nothing changed, don't touch this field at all.
   * Throws if the upload itself fails — callers should catch this the same
   * way they already catch a failed save.
   */
  async function resolve(args: {
    docPrefix: MediaResourceFolder;
    data: Record<string, unknown>;
  }): Promise<{ id: string } | { id: null } | undefined> {
    if (file) {
      const media = await uploadMediaClientSide({ ...args, file });
      return { id: String(media.id) };
    }
    if (removed) {
      return { id: null };
    }
    return undefined;
  }

  /** Call after a successful save, with the server's real (already-denormalized) url — clears staged state without re-uploading. */
  function settle(url: string | null) {
    setPreviewUrl((current) => {
      revokePreview(current);
      return url;
    });
    setFile(null);
    setRemoved(false);
  }

  /** Call when the caller's own validation (e.g. file-type check) rejects a picked file, so it can be re-picked. */
  function rejectInvalidFile() {
    clearFileInput();
  }

  return { previewUrl, isStaged: file !== null, select, remove, reset, resolve, settle, rejectInvalidFile };
}
