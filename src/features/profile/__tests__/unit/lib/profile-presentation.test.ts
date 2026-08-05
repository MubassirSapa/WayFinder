import { describe, expect, it } from "vitest";

import { profileInitial, profileRoleLabel } from "../../../lib/profile-presentation";

describe("profileInitial", () => {
  it("uses the first non-space character from the name", () => {
    expect(profileInitial("  Maya Chen", "maya@example.com")).toBe("M");
  });

  it("falls back to the email when the name is empty", () => {
    expect(profileInitial("   ", "jordan@example.com")).toBe("J");
  });
});

describe("profileRoleLabel", () => {
  it.each([
    ["owner", "Owner"],
    ["manager", "Manager"],
    ["member", "Member"],
  ] as const)("formats the %s role", (role, label) => {
    expect(profileRoleLabel(role)).toBe(label);
  });
});
