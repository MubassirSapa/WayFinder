import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ViewerAboutPage } from "@/features/viewer/pages/about/ViewerAboutPage";

vi.mock("@/components/shared/theme/ModeToggle", () => ({
  ModeToggle: () => <button type="button">Toggle theme</button>,
}));

vi.mock("@/components/shared/public-site/MobileSiteMenu", () => ({
  MobileSiteMenu: () => null,
}));

afterEach(cleanup);

describe("ViewerAboutPage", () => {
  it("explains the viewer flow and links to the public and organization experiences", () => {
    render(<ViewerAboutPage />);

    expect(
      screen.getByRole("heading", { name: "Indoor navigation without the guesswork." }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Browse buildings" })).toBeNull();
    expect(screen.getByRole("button", { name: "For organizations" }).getAttribute("href")).toBe(
      "/organization",
    );
    // "About" now also appears as a footer link, so this needs to find the
    // one nav link specifically marking the current page.
    const activeAboutLinks = screen
      .getAllByRole("link", { name: "About" })
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(activeAboutLinks).toHaveLength(1);
  });

  it("embeds the demo video", () => {
    render(<ViewerAboutPage />);

    const video = document.querySelector("video[aria-label='Wayfinder demo']");
    expect(video).toBeTruthy();
    expect(video?.querySelector("source")?.getAttribute("src")).toBe(
      "https://cdn.umbrellacorp.cc/videos/wayfinder-demo-updated-1080p.mp4",
    );
  });
});
