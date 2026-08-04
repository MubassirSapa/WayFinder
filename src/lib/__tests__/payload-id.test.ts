import { describe, expect, expectTypeOf, it } from "vitest";

import { asPayloadId, type PayloadDocumentId } from "../payload-id";

describe("asPayloadId", () => {
  it("preserves MongoDB ObjectId strings", () => {
    const objectId = "66ab12cd34ef567890abcdef";

    expect(asPayloadId(objectId)).toBe(objectId);
  });

  it("preserves numeric SQL IDs", () => {
    expect(asPayloadId(42)).toBe(42);
  });

  it("converts serialized SQL relationship IDs to numbers", () => {
    expect(asPayloadId("42")).toBe(42);
  });

  it("infers its return type from the generated Payload collection types", () => {
    expectTypeOf(asPayloadId("42")).toEqualTypeOf<PayloadDocumentId>();
  });
});
