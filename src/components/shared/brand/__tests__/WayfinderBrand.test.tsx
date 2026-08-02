import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";

afterEach(cleanup);

describe("WayfinderBrand", () => {
  it("uses the transparent WayFinder PNG while keeping the linked brand label accessible", () => {
    render(<WayfinderBrand href="/" />);

    const link = screen.getByRole("link", { name: "Wayfinder" });
    const image = link.querySelector("img");

    expect(link.getAttribute("href")).toBe("/");
    expect(image?.getAttribute("src")).toContain("wayfinder-no-bg.png");
    expect(image?.getAttribute("alt")).toBe("");
  });
});
