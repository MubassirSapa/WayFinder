import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ModeToggle } from "@/components/shared/theme/ModeToggle";

const themeMock = vi.hoisted(() => ({
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => themeMock,
}));

describe("ModeToggle", () => {
  beforeEach(() => {
    themeMock.setTheme.mockClear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("switches to dark mode from the current document theme", async () => {
    render(<ModeToggle />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
      await Promise.resolve();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(themeMock.setTheme).toHaveBeenCalledWith("dark");
  });

  it("uses the document theme for its label and switches dark mode off", async () => {
    document.documentElement.classList.add("dark");
    render(<ModeToggle />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
      await Promise.resolve();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(themeMock.setTheme).toHaveBeenCalledWith("light");
  });
});
