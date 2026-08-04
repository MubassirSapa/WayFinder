import { describe, expect, it } from "vitest";

import {
  organizationInitials,
  organizationTypeLabel,
  visitorAddressSummary,
} from "../../lib/profile-presentation";

describe("profile presentation", () => {
  it("creates compact initials from an organization name", () => {
    expect(organizationInitials("Toronto General Hospital")).toBe("TG");
    expect(organizationInitials("Wayfinder")).toBe("WA");
    expect(organizationInitials("   ")).toBe("?");
  });

  it("uses the registered facility type label", () => {
    expect(organizationTypeLabel("university")).toBe("University / Campus");
  });

  it("summarizes a location without fabricating missing address details", () => {
    expect(visitorAddressSummary("Toronto", "Canada")).toBe("Toronto, Canada");
    expect(visitorAddressSummary("", "Canada")).toBe("Canada");
    expect(visitorAddressSummary("", "")).toBe("Visitor address not added");
  });
});
