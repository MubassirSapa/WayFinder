import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";

afterEach(cleanup);

describe("WayfinderBrand", () => {
  it("uses the white WayFinder PNG while keeping the linked brand label accessible", () => {
    render(<WayfinderBrand href="/" />);

    const link = screen.getByRole("link", { name: "Wayfinder" });
    const image = link.querySelector("img");

    expect(link.getAttribute("href")).toBe("/");
    expect(image?.getAttribute("src")).toContain("icon1.png");
    expect(image?.getAttribute("alt")).toBe("");
  });
});
