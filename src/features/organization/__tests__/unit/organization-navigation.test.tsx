import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OrganizationSiteHeader } from "@/features/organization/components/OrganizationSiteHeader";
import {
  OrganizationVisitorHandoff,
} from "@/features/organization/components/OrganizationVisitorHandoff";

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
  it("keeps the organization navigation focused on organization pages", () => {
    render(<OrganizationSiteHeader />);

    expect(screen.getByRole("navigation", { name: "Organization navigation" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Wayfinder" }).getAttribute("href")).toBe(
      "/organization",
    );
    expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe(
      "/organization/about",
    );
    const getStarted = screen.getByRole("link", { name: "Get started" });

    expect(getStarted.getAttribute("href")).toBe("/register-organization");
    expect(getStarted.className).toContain("bg-primary");
    expect(screen.queryByRole("link", { name: "Public maps" })).toBeNull();
  });

  it("can hide registration when the current page already presents that action", () => {
    render(<OrganizationSiteHeader showRegistrationAction={false} />);

    expect(screen.queryByRole("link", { name: "Get started" })).toBeNull();
    expect(screen.getByRole("link", { name: "About" })).toBeTruthy();
  });
});

describe("OrganizationVisitorHandoff", () => {
  it("takes visitors directly to the public venue directory", () => {
    render(<OrganizationVisitorHandoff />);

    const link = screen.getByRole("link", { name: "Visiting a building? Find its public map" });

    expect(link.getAttribute("href")).toBe("/buildings");
    expect(link.className).toContain("max-w-6xl");
    expect(link.className).toContain("bg-primary/10");
    expect(link.className).toContain("backdrop-blur-sm");
  });
});
