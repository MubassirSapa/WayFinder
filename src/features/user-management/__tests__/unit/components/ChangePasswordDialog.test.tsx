import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChangePasswordDialog } from "@/features/user-management/components/ChangePasswordDialog";
import { USER_MANAGEMENT_CLIENT } from "@/features/user-management/constants/user-management.constants";

const changeOwnPasswordActionMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/user-management/actions/server/change-password", () => ({
  changeOwnPasswordAction: changeOwnPasswordActionMock,
}));

const toastSuccess = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: toastSuccess },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function openDialog() {
  fireEvent.click(screen.getByRole("button", { name: USER_MANAGEMENT_CLIENT.CHANGE_PASSWORD }));
}

describe("ChangePasswordDialog", () => {
  it("only offers a current-password field - never a target user id", () => {
    render(<ChangePasswordDialog />);
    openDialog();

    expect(screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_CURRENT_PASSWORD_LABEL)).toBeTruthy();
    expect(screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_NEW_PASSWORD_LABEL)).toBeTruthy();
    expect(screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_CONFIRM_PASSWORD_LABEL)).toBeTruthy();
  });

  it("submits current/new/confirm password and closes on success", async () => {
    changeOwnPasswordActionMock.mockResolvedValue({ isSuccess: true, message: "Password changed." });

    render(<ChangePasswordDialog />);
    openDialog();

    fireEvent.change(screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_CURRENT_PASSWORD_LABEL), {
      target: { value: "OldStrong123!" },
    });
    fireEvent.change(screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_NEW_PASSWORD_LABEL), {
      target: { value: "NewStrong123!" },
    });
    fireEvent.change(screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_CONFIRM_PASSWORD_LABEL), {
      target: { value: "NewStrong123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: USER_MANAGEMENT_CLIENT.SAVE }));

    await waitFor(() => {
      expect(changeOwnPasswordActionMock).toHaveBeenCalledWith("OldStrong123!", "NewStrong123!", "NewStrong123!");
    });
    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith(USER_MANAGEMENT_CLIENT.SUCCESS_PASSWORD_CHANGED);
    });
    await waitFor(() => {
      expect(screen.queryByLabelText(USER_MANAGEMENT_CLIENT.FIELD_CURRENT_PASSWORD_LABEL)).toBeNull();
    });
  });

  it("shows the server's error message and keeps the dialog open on failure", async () => {
    changeOwnPasswordActionMock.mockResolvedValue({
      isSuccess: false,
      message: USER_MANAGEMENT_CLIENT.ERROR_CURRENT_PASSWORD_INCORRECT,
    });

    render(<ChangePasswordDialog />);
    openDialog();

    fireEvent.change(screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_CURRENT_PASSWORD_LABEL), {
      target: { value: "WrongCurrent123!" },
    });
    fireEvent.change(screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_NEW_PASSWORD_LABEL), {
      target: { value: "NewStrong123!" },
    });
    fireEvent.change(screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_CONFIRM_PASSWORD_LABEL), {
      target: { value: "NewStrong123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: USER_MANAGEMENT_CLIENT.SAVE }));

    await screen.findByText(USER_MANAGEMENT_CLIENT.ERROR_CURRENT_PASSWORD_INCORRECT);
    expect(screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_CURRENT_PASSWORD_LABEL)).toBeTruthy();
  });
});
