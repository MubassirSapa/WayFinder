import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OrganizationCta } from "@/features/organization/components/OrganizationCta";
import { OrganizationHero } from "@/features/organization/components/OrganizationHero";

afterEach(() => {
  cleanup();
});

describe("organization calls to action", () => {
  it("routes the hero actions to registration and sign in", () => {
    render(<OrganizationHero />);

    const getStarted = screen.getByRole("link", { name: "Get started" });
    const mapVisual = screen.getByText("Level 2").closest('[aria-hidden="true"]');

    expect(getStarted.getAttribute("href")).toBe("/register-organization");
    expect(screen.getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/signin");
    expect(mapVisual).toBeTruthy();
    expect(
      (mapVisual as HTMLElement).compareDocumentPosition(getStarted) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("routes the closing actions to registration and sign in", () => {
    render(<OrganizationCta />);

    const heading = screen.getByRole("heading", { name: "Ready to publish your first map?" });
    const section = heading.closest("section");
    const layout = section?.firstElementChild as HTMLElement | undefined;

    expect(section?.className).toContain("bg-primary/10");
    expect(layout?.className).toContain("text-center");
    expect(layout?.className).toContain("xl:text-left");
    expect(layout?.className).toContain("xl:flex-row");
    expect(screen.getByRole("link", { name: "Get started" }).getAttribute("href")).toBe(
      "/register-organization",
    );
    const signIn = screen.getByRole("link", { name: "Sign in" });

    expect(signIn.getAttribute("href")).toBe("/signin");
    expect(signIn.className).toContain("var(--organization-signin-glow)");
  });
});
