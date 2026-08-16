import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PendingApprovalSection from "@/features/auth/pages/pending-approval/sections/PendingApprovalSection";

const logoutActionMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@/features/auth/actions/server/logout", () => ({
  logoutAction: logoutActionMock,
}));

describe("PendingApprovalSection", () => {
  it("shows the organization's own name instead of generic copy", () => {
    render(<PendingApprovalSection organizationName="Acme Hospital" />);

    expect(screen.getByText("Acme Hospital is pending review")).toBeTruthy();
  });

  it("shows the contact email on its own line, separate from the review message", () => {
    render(<PendingApprovalSection organizationName="Acme Hospital" />);

    const reviewMessage = screen.getByText(/we're reviewing your signup/i);
    const contactLine = screen.getByText(/questions in the meantime/i);

    expect(reviewMessage).toBeTruthy();
    expect(contactLine).toBeTruthy();
    expect(reviewMessage).not.toBe(contactLine);
    expect(contactLine.textContent).toContain("umbrella.corp.app@gmail.com");
  });

  it("signs the user out when the Sign Out button is clicked", async () => {
    render(<PendingApprovalSection organizationName="Acme Hospital" />);

    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));

    await waitFor(() => expect(logoutActionMock).toHaveBeenCalled());
  });
});
