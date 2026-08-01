import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CheckEmailSection from "@/features/auth/pages/check-email/sections/CheckEmailSection";

vi.mock("nextjs-toploader/app", () => ({
  useRouter: () => ({ back: vi.fn() }),
}));

describe("CheckEmailSection", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reveals the sign-in option after ten seconds", () => {
    vi.useFakeTimers();
    render(<CheckEmailSection />);

    expect(screen.getByText("Sign-in option available in 10 seconds")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Sign In" })).toBeNull();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByText(/verified on another device/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign In" }).getAttribute("href")).toBe(
      "/signin",
    );
  });
});
