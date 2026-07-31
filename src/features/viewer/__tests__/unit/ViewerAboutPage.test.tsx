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
    expect(screen.getByRole("button", { name: "Browse venues" }).getAttribute("href")).toBe(
      "/venues",
    );
    expect(screen.getByRole("button", { name: "For organizations" }).getAttribute("href")).toBe(
      "/organization",
    );
    expect(screen.getByRole("link", { name: "About" }).getAttribute("aria-current")).toBe("page");
  });
});
