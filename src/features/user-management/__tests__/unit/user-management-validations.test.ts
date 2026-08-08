import { describe, expect, it } from "vitest";

import { ChangeOwnPasswordSchema } from "@/features/user-management/validations/change-password";
import { UpdateOrgUserInfoSchema } from "@/features/user-management/validations/update-org-user-info";

const strongPassword = "Strong123!";

describe("user-management validation schemas", () => {
  it("accepts a valid name for updating a user's info", () => {
    expect(UpdateOrgUserInfoSchema.safeParse({ name: "Jordan Lee" }).success).toBe(true);
  });

  it("rejects a name that's too short or too long", () => {
    expect(UpdateOrgUserInfoSchema.safeParse({ name: "A" }).success).toBe(false);
    expect(UpdateOrgUserInfoSchema.safeParse({ name: "A".repeat(81) }).success).toBe(false);
  });

  it("accepts a complete password-change payload", () => {
    const result = ChangeOwnPasswordSchema.safeParse({
      currentPassword: "OldStrong123!",
      newPassword: strongPassword,
      confirmNewPassword: strongPassword,
    });

    expect(result.success).toBe(true);
  });

  it("requires a current password", () => {
    const result = ChangeOwnPasswordSchema.safeParse({
      currentPassword: "",
      newPassword: strongPassword,
      confirmNewPassword: strongPassword,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("currentPassword");
    }
  });

  it("rejects a weak new password", () => {
    const result = ChangeOwnPasswordSchema.safeParse({
      currentPassword: "OldStrong123!",
      newPassword: "password",
      confirmNewPassword: "password",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a new password that doesn't match its confirmation", () => {
    const result = ChangeOwnPasswordSchema.safeParse({
      currentPassword: "OldStrong123!",
      newPassword: strongPassword,
      confirmNewPassword: "Different123!",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("confirmNewPassword");
    }
  });
});
