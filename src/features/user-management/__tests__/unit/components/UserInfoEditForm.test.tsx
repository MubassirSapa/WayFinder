import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UserInfoEditForm } from "@/features/user-management/components/UserInfoEditForm";
import { USER_MANAGEMENT_CLIENT } from "@/features/user-management/constants/user-management.constants";
import type { OrgUserDetail } from "@/features/user-management/types/user-management.types";

const router = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("nextjs-toploader/app", () => ({
  useRouter: () => router,
}));

const updateOrgUserInfoActionMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/user-management/actions/server/update-org-user", () => ({
  updateOrgUserInfoAction: updateOrgUserInfoActionMock,
}));

const user: OrgUserDetail = {
  id: "user-1",
  name: "Jordan Lee",
  email: "jordan@example.com",
  role: "member",
  avatarUrl: null,
  buildingIds: [],
  buildingNames: [],
  isSelf: true,
  blocked: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  inviteHistory: null,
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UserInfoEditForm", () => {
  it("submits the edited name and calls onSaved on success", async () => {
    updateOrgUserInfoActionMock.mockResolvedValue({
      isSuccess: true,
      data: { ...user, name: "Jordan A. Lee" },
    });
    const onSaved = vi.fn();

    render(<UserInfoEditForm user={user} onCancel={vi.fn()} onSaved={onSaved} />);

    const nameInput = screen.getByLabelText(USER_MANAGEMENT_CLIENT.FIELD_NAME_LABEL);
    fireEvent.change(nameInput, { target: { value: "Jordan A. Lee" } });
    fireEvent.click(screen.getByRole("button", { name: USER_MANAGEMENT_CLIENT.SAVE }));

    await waitFor(() => {
      expect(updateOrgUserInfoActionMock).toHaveBeenCalledTimes(1);
    });
    const [calledUserId, calledFormData] = updateOrgUserInfoActionMock.mock.calls[0];
    expect(calledUserId).toBe("user-1");
    expect(calledFormData.get("name")).toBe("Jordan A. Lee");

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });

  it("shows the server's error message and does not call onSaved on failure", async () => {
    updateOrgUserInfoActionMock.mockResolvedValue({ isSuccess: false, message: "Could not update this user." });
    const onSaved = vi.fn();

    render(<UserInfoEditForm user={user} onCancel={vi.fn()} onSaved={onSaved} />);

    fireEvent.click(screen.getByRole("button", { name: USER_MANAGEMENT_CLIENT.SAVE }));

    await screen.findByText("Could not update this user.");
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("calls onCancel without saving", () => {
    const onCancel = vi.fn();

    render(<UserInfoEditForm user={user} onCancel={onCancel} onSaved={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: USER_MANAGEMENT_CLIENT.CANCEL }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(updateOrgUserInfoActionMock).not.toHaveBeenCalled();
  });
});
