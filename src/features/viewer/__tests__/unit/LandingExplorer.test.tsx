import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LandingExplorer } from "@/features/viewer/pages/home/LandingExplorer";
import type { PublicLandingData } from "@/features/viewer/types";

const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("nextjs-toploader/app", () => ({
  useRouter: () => router,
}));

const data: PublicLandingData = {
  isAvailable: true,
  venues: [
    {
      id: "hospital",
      name: "Greenfield General Hospital",
      address: null,
    backgroundImageUrl: null,
      logoUrl: null,
      organizationId: "org-1",
      organizationName: "Org One",
      organizationLogoUrl: null,
      addedAt: "2026-07-28T12:00:00.000Z",
      href: "/map/1",
      floors: [{ id: "1", name: "Main Floor", level: 0, href: "/map/1" }],
    },
    {
      id: "campus",
      name: "Seneca Campus",
      address: null,
    backgroundImageUrl: null,
      logoUrl: null,
      organizationId: "org-1",
      organizationName: "Org One",
      organizationLogoUrl: null,
      addedAt: "2026-07-29T12:00:00.000Z",
      href: "/map/2",
      floors: [
        { id: "2", name: "Main Campus", level: 0, href: "/map/2" },
        { id: "3", name: "Upper Campus", level: 1, href: "/map/3" },
      ],
    },
    {
      id: "riverside",
      name: "Riverside Mall",
      address: null,
    backgroundImageUrl: null,
      logoUrl: null,
      organizationId: "org-2",
      organizationName: "Org Two",
      organizationLogoUrl: null,
      addedAt: "2026-07-30T12:00:00.000Z",
      href: "/map/7",
      floors: [{ id: "7", name: "Main Floor", level: 0, href: "/map/7" }],
    },
  ],
};

afterEach(() => {
  cleanup();
  router.push.mockClear();
});

describe("LandingExplorer", () => {
  it("shows popular and recently added venues without category filters", () => {
    render(<LandingExplorer data={data} />);

    expect(screen.queryByRole("navigation", { name: "Venue types" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Filter by organization" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Recently added" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Browse venues" })).toBeTruthy();
  });

  it("opens the map when a one-floor venue is the only search result", () => {
    render(<LandingExplorer data={data} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Search by venue name" }), {
      target: { value: "Greenfield" },
    });
    fireEvent.submit(screen.getByRole("search", { name: "Search venues" }));

    expect(router.push).toHaveBeenCalledWith("/map/1");
  });

  it("asks for a floor when a venue has multiple published floors", () => {
    render(<LandingExplorer data={data} />);

    const venuesSection = screen.getByRole("heading", { name: "Browse venues" }).closest("section");
    expect(venuesSection).toBeTruthy();
    fireEvent.click(
      within(venuesSection as HTMLElement).getByRole("button", {
        name: "Choose a floor at Seneca Campus",
      }),
    );

    expect(screen.getByRole("dialog", { name: "Seneca Campus" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Main Campus map" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Upper Campus map" })).toBeTruthy();
  });

  it("filters the browse-venues grid to an organization's buildings when its popular circle is clicked", () => {
    render(<LandingExplorer data={data} />);

    fireEvent.click(screen.getByRole("button", { name: "Show venues for Org Two" }));

    const venuesSection = screen.getByRole("heading", { name: "Browse venues" }).closest("section");
    expect(venuesSection).toBeTruthy();
    expect(
      within(venuesSection as HTMLElement).getByRole("button", {
        name: "Choose a floor at Riverside Mall",
      }),
    ).toBeTruthy();
    expect(
      within(venuesSection as HTMLElement).queryByRole("button", {
        name: "Choose a floor at Seneca Campus",
      }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: "Showing Org Two" })).toBeTruthy();
  });

  it("clears the organization filter", () => {
    render(<LandingExplorer data={data} />);

    fireEvent.click(screen.getByRole("button", { name: "Show venues for Org Two" }));
    fireEvent.click(screen.getByRole("button", { name: "Showing Org Two" }));

    const venuesSection = screen.getByRole("heading", { name: "Browse venues" }).closest("section");
    expect(venuesSection).toBeTruthy();
    expect(
      within(venuesSection as HTMLElement).getByRole("button", {
        name: "Choose a floor at Seneca Campus",
      }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Showing Org Two" })).toBeNull();
  });

  it("uses the same floor selector for a one-floor venue", () => {
    render(<LandingExplorer data={data} />);

    const venuesSection = screen.getByRole("heading", { name: "Browse venues" }).closest("section");
    expect(venuesSection).toBeTruthy();
    fireEvent.click(
      within(venuesSection as HTMLElement).getByRole("button", {
        name: "Choose a floor at Greenfield General Hospital",
      }),
    );

    expect(screen.getByRole("link", { name: "Open Main Floor map" })).toBeTruthy();
  });

  it("links the home preview to the complete venue directory", () => {
    const expandedData: PublicLandingData = {
      ...data,
      venues: [
        ...data.venues,
        {
          id: "library",
          name: "Central Library",
          address: null,
    backgroundImageUrl: null,
      logoUrl: null,
      organizationId: "org-1",
      organizationName: "Org One",
      organizationLogoUrl: null,
          addedAt: "2026-07-24T12:00:00.000Z",
          href: "/map/4",
          floors: [{ id: "4", name: "Library Main Floor", level: 0, href: "/map/4" }],
        },
        {
          id: "market",
          name: "Central Market",
          address: null,
    backgroundImageUrl: null,
      logoUrl: null,
      organizationId: "org-1",
      organizationName: "Org One",
      organizationLogoUrl: null,
          addedAt: "2026-07-25T12:00:00.000Z",
          href: "/map/5",
          floors: [{ id: "5", name: "Market Main Floor", level: 0, href: "/map/5" }],
        },
        {
          id: "offices",
          name: "Civic Offices",
          address: null,
    backgroundImageUrl: null,
      logoUrl: null,
      organizationId: "org-1",
      organizationName: "Org One",
      organizationLogoUrl: null,
          addedAt: "2026-07-26T12:00:00.000Z",
          href: "/map/6",
          floors: [{ id: "6", name: "Office Main Floor", level: 0, href: "/map/6" }],
        },
      ],
    };

    render(<LandingExplorer data={expandedData} />);

    const venuesSection = screen.getByRole("heading", { name: "Browse venues" }).closest("section");
    expect(venuesSection).toBeTruthy();
    expect(
      within(venuesSection as HTMLElement).queryByRole("button", {
        name: "Choose a floor at Civic Offices",
      }),
    ).toBeNull();
    const browseLink = within(venuesSection as HTMLElement).getByRole("button", {
      name: "View all",
    });
    const recentSection = screen.getByRole("heading", { name: "Recently added" }).closest("section");

    expect(recentSection).toBeTruthy();
    expect(browseLink.getAttribute("href")).toBe("/venues");
    expect(
      within(recentSection as HTMLElement)
        .getByRole("button", { name: "View all" })
        .getAttribute("href"),
    ).toBe("/venues?view=recent");
  });

  it("links organizations to the organization page", () => {
    render(<LandingExplorer data={data} />);

    const promotion = screen
      .getByRole("heading", { name: "Help visitors find the right floor." })
      .closest("section");

    expect(promotion).toBeTruthy();
    expect(
      within(promotion as HTMLElement)
        .getByRole("button", { name: "Get started" })
        .getAttribute("href"),
    ).toBe("/organization");
    expect(within(promotion as HTMLElement).queryByText("See how it works")).toBeNull();
    expect(within(promotion as HTMLElement).queryByText("Free to use for organizations.")).toBeNull();
  });
});
