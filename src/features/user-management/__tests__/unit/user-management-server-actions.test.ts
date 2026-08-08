import { beforeEach, describe, expect, it, vi } from "vitest";

import { USER_MANAGEMENT_CLIENT } from "@/features/user-management/constants/user-management.constants";
import { changeOwnPasswordAction } from "@/features/user-management/actions/server/change-password";
import { updateOrgUserInfoAction } from "@/features/user-management/actions/server/update-org-user";

const fakeUser = { id: "user-1", email: "owner@example.com" };

const authPortsMock = vi.hoisted(() => ({
  changeOwnPassword: vi.fn(),
  getCurrentUser: vi.fn(),
}));
const userManagementPortsMock = vi.hoisted(() => ({
  updateOrgUserInfo: vi.fn(),
}));

vi.mock("@/features/auth/services/server/auth.ports", () => authPortsMock);
vi.mock("@/features/user-management/services/server/user-management.ports", () => userManagementPortsMock);
// updateOrgUserInfoAction calls revalidatePath, which needs a request-scoped
// Next.js store that doesn't exist in a plain unit test - only the call
// itself is asserted-around indirectly here (via the success-path tests
// still resolving), not its behavior.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("updateOrgUserInfoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authPortsMock.getCurrentUser.mockResolvedValue({ data: fakeUser, isSuccess: true });
  });

  it("requires an authenticated user before touching the port", async () => {
    authPortsMock.getCurrentUser.mockResolvedValue({ isSuccess: false, message: "Not signed in" });

    const formData = new FormData();
    formData.set("name", "New Name");

    const result = await updateOrgUserInfoAction("target-1", formData);

    expect(userManagementPortsMock.updateOrgUserInfo).not.toHaveBeenCalled();
    expect(result).toMatchObject({ isSuccess: false, message: USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED });
  });

  it("rejects a name that's too short before calling the port", async () => {
    const formData = new FormData();
    formData.set("name", "A");

    const result = await updateOrgUserInfoAction("target-1", formData);

    expect(userManagementPortsMock.updateOrgUserInfo).not.toHaveBeenCalled();
    expect(result?.isSuccess).toBe(false);
  });

  it("passes the trimmed name and staged avatar fields to the port", async () => {
    userManagementPortsMock.updateOrgUserInfo.mockResolvedValue({
      data: { id: "target-1", name: "New Name" },
      isSuccess: true,
    });

    const formData = new FormData();
    formData.set("name", "  New Name  ");
    formData.set("avatarId", "media-42");
    formData.set("removeAvatar", "false");

    const result = await updateOrgUserInfoAction("target-1", formData);

    expect(userManagementPortsMock.updateOrgUserInfo).toHaveBeenCalledWith(fakeUser, "target-1", {
      name: "New Name",
      avatarId: "media-42",
      removeAvatar: false,
    });
    expect(result).toMatchObject({ isSuccess: true, message: USER_MANAGEMENT_CLIENT.SUCCESS_INFO_UPDATED });
  });

  it("treats removeAvatar=true with no avatarId as clearing the photo", async () => {
    userManagementPortsMock.updateOrgUserInfo.mockResolvedValue({
      data: { id: "target-1", name: "New Name" },
      isSuccess: true,
    });

    const formData = new FormData();
    formData.set("name", "New Name");
    formData.set("removeAvatar", "true");

    await updateOrgUserInfoAction("target-1", formData);

    expect(userManagementPortsMock.updateOrgUserInfo).toHaveBeenCalledWith(fakeUser, "target-1", {
      name: "New Name",
      avatarId: null,
      removeAvatar: true,
    });
  });

  it("surfaces the port's own failure message", async () => {
    userManagementPortsMock.updateOrgUserInfo.mockResolvedValue({ isSuccess: false, message: "Forbidden" });

    const formData = new FormData();
    formData.set("name", "New Name");

    const result = await updateOrgUserInfoAction("target-1", formData);

    expect(result).toMatchObject({ isSuccess: false, message: "Forbidden" });
  });
});

describe("changeOwnPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authPortsMock.getCurrentUser.mockResolvedValue({ data: fakeUser, isSuccess: true });
  });

  it("requires an authenticated user before touching the port", async () => {
    authPortsMock.getCurrentUser.mockResolvedValue({ isSuccess: false, message: "Not signed in" });

    const result = await changeOwnPasswordAction("Current123!", "NewStrong123!", "NewStrong123!");

    expect(authPortsMock.changeOwnPassword).not.toHaveBeenCalled();
    expect(result).toMatchObject({ isSuccess: false, message: USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED });
  });

  it("rejects a missing current password before calling the port", async () => {
    const result = await changeOwnPasswordAction("", "NewStrong123!", "NewStrong123!");

    expect(authPortsMock.changeOwnPassword).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      isSuccess: false,
      message: USER_MANAGEMENT_CLIENT.VALIDATION_CURRENT_PASSWORD_REQUIRED,
    });
  });

  it("rejects a weak new password before calling the port", async () => {
    const result = await changeOwnPasswordAction("Current123!", "weak", "weak");

    expect(authPortsMock.changeOwnPassword).not.toHaveBeenCalled();
    expect(result?.isSuccess).toBe(false);
  });

  it("rejects a new password that doesn't match its confirmation", async () => {
    const result = await changeOwnPasswordAction("Current123!", "NewStrong123!", "Different123!");

    expect(authPortsMock.changeOwnPassword).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      isSuccess: false,
      message: USER_MANAGEMENT_CLIENT.VALIDATION_CONFIRM_MISMATCH,
    });
  });

  it("changes the password for the current user only - no target id is ever accepted", async () => {
    authPortsMock.changeOwnPassword.mockResolvedValue({ data: undefined, isSuccess: true });

    const result = await changeOwnPasswordAction("Current123!", "NewStrong123!", "NewStrong123!");

    expect(authPortsMock.changeOwnPassword).toHaveBeenCalledWith(fakeUser, "Current123!", "NewStrong123!");
    expect(authPortsMock.changeOwnPassword).toHaveBeenCalledTimes(1);
    // Sanity check on the mocked port's own signature: it never receives a
    // second user/target id, only the acting user + the two passwords.
    expect(authPortsMock.changeOwnPassword.mock.calls[0]).toHaveLength(3);
    expect(result).toMatchObject({ isSuccess: true, message: USER_MANAGEMENT_CLIENT.SUCCESS_PASSWORD_CHANGED });
  });

  it("surfaces an incorrect-current-password failure from the port", async () => {
    authPortsMock.changeOwnPassword.mockResolvedValue({
      isSuccess: false,
      message: USER_MANAGEMENT_CLIENT.ERROR_CURRENT_PASSWORD_INCORRECT,
    });

    const result = await changeOwnPasswordAction("WrongCurrent123!", "NewStrong123!", "NewStrong123!");

    expect(result).toMatchObject({
      isSuccess: false,
      message: USER_MANAGEMENT_CLIENT.ERROR_CURRENT_PASSWORD_INCORRECT,
    });
  });
});
