import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OrganizationSiteHeader } from "@/features/organization/components/OrganizationSiteHeader";

vi.mock("@/components/shared/theme/ModeToggle", () => ({
  ModeToggle: () => <button type="button">Toggle theme</button>,
}));

vi.mock("@/components/shared/public-site/MobileSiteMenu", () => ({
  MobileSiteMenu: () => null,
}));

afterEach(() => {
  cleanup();
});

describe("OrganizationSiteHeader", () => {
  it("links the organization brand and navigation to the correct public pages", () => {
    render(<OrganizationSiteHeader />);

    expect(screen.getByRole("navigation", { name: "Organization navigation" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Wayfinder" }).getAttribute("href")).toBe(
      "/organization",
    );
    expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe(
      "/organization/about",
    );
    expect(screen.getByRole("link", { name: "Public maps" }).getAttribute("href")).toBe("/");
  });
});
