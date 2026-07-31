import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SmoothHashLink } from "@/components/shared/public-site/SmoothHashLink";

const scrollIntoView = vi.fn();

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  scrollIntoView.mockReset();
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoView,
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({ matches: false }),
  });
});

afterEach(cleanup);

describe("SmoothHashLink", () => {
  it("smoothly scrolls to a target on the current page", () => {
    const target = document.createElement("section");
    target.id = "venues";
    document.body.append(target);

    render(<SmoothHashLink href="/#venues">Discover</SmoothHashLink>);
    fireEvent.click(screen.getByRole("link", { name: "Discover" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(window.location.hash).toBe("#venues");

    target.remove();
  });
});
