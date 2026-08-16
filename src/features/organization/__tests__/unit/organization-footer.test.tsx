import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OrganizationSiteFooter } from "@/features/organization/components/OrganizationSiteFooter";

afterEach(() => {
  cleanup();
});

// "About" is intentionally reused for two different links (Explore's site
// About and Organization's own About) since each is disambiguated by its
// column heading - getAllByRole + some() below handles a label matching
// more than one link, not just the single-match case.
const expectedFooterLinks = [
  ["Wayfinder", "/organization"],
  ["Home", "/#buildings"],
  ["Buildings", "/buildings"],
  ["About", "/about"],
  ["Overview", "/organization"],
  ["About", "/organization/about"],
  ["Contact", "/organization/contact"],
  ["Get started", "/register-organization"],
  ["Privacy Policy", "/privacy"],
  ["Terms of Service", "/terms"],
] as const;

describe("OrganizationSiteFooter", () => {
  it.each(expectedFooterLinks)("links %s to %s", (label, href) => {
    render(<OrganizationSiteFooter />);

    const matches = screen.getAllByRole("link", { name: label });
    expect(matches.some((link) => link.getAttribute("href") === href)).toBe(true);
  });
});
