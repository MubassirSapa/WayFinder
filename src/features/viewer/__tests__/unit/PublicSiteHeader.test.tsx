import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PublicSiteHeader } from "@/features/viewer/components/PublicSiteHeader";

vi.mock("@/components/shared/theme/ModeToggle", () => ({
  ModeToggle: () => <button type="button">Toggle theme</button>,
}));

vi.mock("@/components/shared/public-site/MobileSiteMenu", () => ({
  MobileSiteMenu: () => null,
}));

afterEach(() => {
  cleanup();
});

describe("PublicSiteHeader", () => {
  it("links out to the organization site alongside the public viewer pages", () => {
    render(<PublicSiteHeader />);

    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/#buildings");
    expect(screen.getByRole("link", { name: "Buildings" }).getAttribute("href")).toBe("/buildings");
    expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe("/about");
    expect(screen.getByRole("link", { name: "Organization" }).getAttribute("href")).toBe(
      "/organization",
    );
  });
});
