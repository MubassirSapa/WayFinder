import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OrganizationSiteFooter } from "@/features/organization/components/OrganizationSiteFooter";

afterEach(() => {
  cleanup();
});

const expectedFooterLinks = [
  ["Wayfinder", "/organization"],
  ["Discover", "/#venues"],
  ["Venues", "/venues"],
  ["About Wayfinder", "/about"],
  ["For organizations", "/organization"],
  ["About organizations", "/organization/about"],
  ["Join now", "/register-organization"],
  ["Privacy Policy", "/privacy"],
  ["Terms of Service", "/terms"],
] as const;

describe("OrganizationSiteFooter", () => {
  it.each(expectedFooterLinks)("links %s to %s", (label, href) => {
    render(<OrganizationSiteFooter />);

    expect(screen.getByRole("link", { name: label }).getAttribute("href")).toBe(href);
  });
});
