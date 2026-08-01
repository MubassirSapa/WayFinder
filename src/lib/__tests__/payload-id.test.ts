import { describe, expect, it } from "vitest";

import { asPayloadId } from "../payload-id";

describe("asPayloadId", () => {
  it("preserves MongoDB ObjectId strings", () => {
    const objectId = "66ab12cd34ef567890abcdef";

    expect(asPayloadId(objectId)).toBe(objectId);
  });

  it("preserves numeric SQL IDs", () => {
    expect(asPayloadId(42)).toBe(42);
  });
});
