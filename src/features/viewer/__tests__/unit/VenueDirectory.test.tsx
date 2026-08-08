import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VenueDirectory } from "@/features/viewer/pages/venues/VenueDirectory";
import type { PublicLandingData } from "@/features/viewer/types";

const data: PublicLandingData = {
  isAvailable: true,
  venues: [
    {
      id: "hospital",
      name: "Greenfield Hospital",
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
      floors: [{ id: "2", name: "Campus Floor", level: 0, href: "/map/2" }],
    },
  ],
};

afterEach(cleanup);

describe("VenueDirectory", () => {
  it("filters the complete venue list by name", () => {
    render(<VenueDirectory data={data} />);

    expect(screen.getByRole("heading", { name: "Browse buildings" })).toBeTruthy();

    fireEvent.change(screen.getByRole("textbox", { name: "Search buildings" }), {
      target: { value: "Greenfield" },
    });

    expect(screen.getByRole("button", { name: "Choose a floor at Greenfield Hospital" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Choose a floor at Seneca Campus" })).toBeNull();
  });

  it("opens floor choices in a dialog instead of expanding the venue card", () => {
    render(<VenueDirectory data={data} />);

    fireEvent.click(screen.getByRole("button", { name: "Choose a floor at Greenfield Hospital" }));

    expect(screen.getByRole("dialog", { name: "Greenfield Hospital" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Main Floor map" })).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Available maps for Greenfield Hospital" })).toBeNull();
  });

  it("shows the newest venues first in the recently added view", () => {
    render(<VenueDirectory data={data} view="recent" />);

    expect(screen.getByRole("heading", { name: "Recently added buildings" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Recently added" }).getAttribute("aria-current"))
      .toBe("page");

    const venueButtons = screen.getAllByRole("button", { name: /Choose a floor at/ });
    expect(venueButtons[0].getAttribute("aria-label")).toBe("Choose a floor at Seneca Campus");
  });
});
