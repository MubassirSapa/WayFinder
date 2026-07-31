import { describe, it, expect } from "vitest";

import {
  formatRelativeTime,
  levelToBadge,
  levelToLabel,
  organizationInitials,
  organizationTypeLabel,
} from "../../../lib/floorPresentation";

describe("levelToBadge / levelToLabel", () => {
  it("maps known levels to their configured badge and label", () => {
    expect(levelToBadge(0)).toBe("GF");
    expect(levelToLabel(0)).toBe("Ground");
    expect(levelToBadge(-1)).toBe("LG");
    expect(levelToLabel(-1)).toBe("Lower Ground");
    expect(levelToBadge(3)).toBe("L3");
  });

  it("falls back to generic labels for unknown levels", () => {
    expect(levelToBadge(9)).toBe("L9");
    expect(levelToLabel(9)).toBe("Level 9");
  });
});

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

describe("formatRelativeTime", () => {
  const now = new Date("2026-06-19T12:00:00.000Z").getTime();

  it("returns 'Just now' for recent timestamps", () => {
    expect(formatRelativeTime(new Date(now - 30_000).toISOString(), now)).toBe("Just now");
  });

  it("pluralises minutes, hours and days", () => {
    expect(formatRelativeTime(new Date(now - 60_000).toISOString(), now)).toBe("1 minute ago");
    expect(formatRelativeTime(new Date(now - 2 * 3_600_000).toISOString(), now)).toBe("2 hours ago");
    expect(formatRelativeTime(new Date(now - 3 * 86_400_000).toISOString(), now)).toBe("3 days ago");
  });

  it("returns an empty string for invalid input", () => {
    expect(formatRelativeTime("not-a-date", now)).toBe("");
  });
});
