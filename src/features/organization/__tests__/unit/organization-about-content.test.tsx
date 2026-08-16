import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OrganizationAboutContent } from "@/features/organization/components/OrganizationAboutContent";

afterEach(() => {
  cleanup();
});

describe("OrganizationAboutContent", () => {
  it("leads with org control and visitor benefit instead of implementation detail", () => {
    render(<OrganizationAboutContent />);

    expect(
      screen.getByRole("heading", { name: "Built to answer the question a floor plan can't." }),
    ).toBeTruthy();
    expect(screen.getByText("Your map, always under your control")).toBeTruthy();
    expect(screen.getByText("What your visitors get")).toBeTruthy();
    expect(screen.queryByText(/navigation layer/i)).toBeNull();
  });

  it("gives concrete benefit boxes for both the org and its visitors", () => {
    render(<OrganizationAboutContent />);

    expect(screen.getByRole("heading", { name: "Built for your team" })).toBeTruthy();
    expect(screen.getByText("Every building in one place")).toBeTruthy();
    expect(screen.getByText("Your team, your roles")).toBeTruthy();
    expect(screen.getByText("Update anytime, publish when ready")).toBeTruthy();

    expect(screen.getByText("No app, no account")).toBeTruthy();
    expect(screen.getByText("A route, not a guess")).toBeTruthy();
    expect(screen.getByText("Scan a QR, start right there")).toBeTruthy();
  });

  it("walks through the three real steps in order", () => {
    render(<OrganizationAboutContent />);

    const steps = screen.getAllByRole("listitem");

    expect(steps).toHaveLength(3);
    expect(steps[0].textContent).toContain("Your team maps the building");
    expect(steps[1].textContent).toContain("Publish when a floor is ready");
    expect(steps[2].textContent).toContain("Visitors search and go");
  });
});
