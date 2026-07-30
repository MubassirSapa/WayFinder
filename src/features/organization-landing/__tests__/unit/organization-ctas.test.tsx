import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OrganizationCta } from "@/features/organization-landing/components/OrganizationCta";
import { OrganizationHero } from "@/features/organization-landing/components/OrganizationHero";

afterEach(() => {
  cleanup();
});

describe("organization calls to action", () => {
  it("routes the hero actions to registration and sign in", () => {
    render(<OrganizationHero />);

    expect(screen.getByRole("link", { name: "Join now" }).getAttribute("href")).toBe(
      "/register-organization",
    );
    expect(screen.getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/signin");
  });

  it("routes the closing actions to registration and sign in", () => {
    render(<OrganizationCta variant="compact" />);

    expect(screen.getByRole("link", { name: "Join now" }).getAttribute("href")).toBe(
      "/register-organization",
    );
    expect(
      screen.getByRole("link", { name: "Already have an account? Sign in" }).getAttribute("href"),
    ).toBe("/signin");
  });
});
