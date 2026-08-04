import { describe, it, expect } from "vitest";

import { organizationInitials, organizationTypeLabel } from "../../../lib/organizationPresentation";

describe("organizationTypeLabel", () => {
  it("returns the human label for a known type", () => {
    expect(organizationTypeLabel("hospital")).toBe("Hospital / Healthcare");
  });

  it("falls back for unknown or missing types", () => {
    expect(organizationTypeLabel(undefined)).toBe("Organization");
    expect(organizationTypeLabel("unknown")).toBe("Organization");
  });
});

describe("organizationInitials", () => {
  it("takes the first letters of the first two words", () => {
    expect(organizationInitials("St. Helen's Medical Center")).toBe("SH");
  });

  it("uses the first two characters of a single word", () => {
    expect(organizationInitials("UmbrellaCorp")).toBe("UM");
  });

  it("falls back for empty input", () => {
    expect(organizationInitials("   ")).toBe("?");
  });
});
