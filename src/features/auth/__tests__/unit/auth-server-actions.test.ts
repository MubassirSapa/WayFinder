import { beforeEach, describe, expect, it, vi } from "vitest";

import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { FORGOT_PASSWORD_CLIENT } from "@/features/auth/constants/forgot-password";
import { RESET_PASSWORD_CLIENT } from "@/features/auth/constants/reset-password";
import { SIGNIN_CLIENT } from "@/features/auth/constants/signin";
import { SIGNUP_CLIENT } from "@/features/auth/constants/signup";
import { VERIFY_EMAIL_CLIENT } from "@/features/auth/constants/verify-email";
import { forgotPasswordAction } from "@/features/auth/actions/server/forgot-password";
import { resetPasswordAction } from "@/features/auth/actions/server/reset-password";
import { signinAction } from "@/features/auth/actions/server/signin";
import { signupAction } from "@/features/auth/actions/server/signup";
import { verifyEmailAction } from "@/features/auth/actions/server/verify-email";

const redirectMock = vi.hoisted(() => vi.fn());
const authPortsMock = vi.hoisted(() => ({
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/services/server/auth.ports", () => authPortsMock);

const signupPayload = {
  name: "Mubassir Sapa",
  email: "mubassir@example.com",
  password: "Strong123!",
  organization: {
    name: "Wayfinder HQ",
    type: "office" as const,
  },
};

describe("auth server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redirectMock.mockImplementation(() => undefined);
  });

  it("redirects to the private dashboard after successful sign in", async () => {
    authPortsMock.signIn.mockResolvedValue({
      data: null,
      isSuccess: true,
      message: "Signed in",
    });

    await signinAction({
      email: "owner@example.com",
      password: "Strong123!",
    });

    expect(authPortsMock.signIn).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "Strong123!",
    });
    expect(redirectMock).toHaveBeenCalledWith(PRIVATE_ROUTES.DASHBOARD);
  });

  it("returns a generic sign in error for invalid credentials", async () => {
    authPortsMock.signIn.mockResolvedValue({
      errors: [{ message: "Invalid login" }],
      isSuccess: false,
      message: "Invalid login",
    });

    const result = await signinAction({
      email: "owner@example.com",
      password: "wrong-password",
    });

    expect(result).toMatchObject({
      isSuccess: false,
      message: SIGNIN_CLIENT.WRONG_CREDENTIALS,
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to check email after successful signup", async () => {
    authPortsMock.signUp.mockResolvedValue({
      data: null,
      isSuccess: true,
      message: "Created",
    });

    await signupAction(signupPayload);

    expect(authPortsMock.signUp).toHaveBeenCalledWith(signupPayload);
    expect(redirectMock).toHaveBeenCalledWith(PUBLIC_ROUTES.CHECK_EMAIL);
  });

  it("returns a specific duplicate email message during signup", async () => {
    authPortsMock.signUp.mockResolvedValue({
      errors: [{ code: "EMAIL_ALREADY_EXISTS", message: "Email already exists" }],
      isSuccess: false,
      message: "Email already exists",
    });

    const result = await signupAction(signupPayload);

    expect(result).toMatchObject({
      isSuccess: false,
      message: SIGNUP_CLIENT.EMAIL_TAKEN,
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("does not reveal whether an email exists during forgot password", async () => {
    authPortsMock.forgotPassword.mockResolvedValue(undefined);

    const result = await forgotPasswordAction({
      email: "owner@example.com",
    });

    expect(authPortsMock.forgotPassword).toHaveBeenCalledWith("owner@example.com");
    expect(result).toMatchObject({
      isSuccess: true,
      message: FORGOT_PASSWORD_CLIENT.SUCCESS_DESC,
    });
  });

  it("validates reset token before calling the reset password port", async () => {
    const result = await resetPasswordAction(
      {
        password: "Strong123!",
        confirmPassword: "Strong123!",
      },
      "short",
    );

    expect(authPortsMock.resetPassword).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      isSuccess: false,
      message: RESET_PASSWORD_CLIENT.VALIDATION_TOKEN_ERROR,
    });
  });

  it("resets password with a valid token and matching password", async () => {
    authPortsMock.resetPassword.mockResolvedValue({
      data: null,
      isSuccess: true,
      message: "Updated",
    });

    const result = await resetPasswordAction(
      {
        password: "Strong123!",
        confirmPassword: "Strong123!",
      },
      "1234567890abcdef",
    );

    expect(authPortsMock.resetPassword).toHaveBeenCalledWith("1234567890abcdef", "Strong123!");
    expect(result).toMatchObject({
      isSuccess: true,
      message: RESET_PASSWORD_CLIENT.SUCCESS_DESC,
    });
  });

  it("verifies the email token without any further side effects", async () => {
    authPortsMock.verifyEmail.mockResolvedValue({
      data: null,
      isSuccess: true,
      message: VERIFY_EMAIL_CLIENT.SUCCESS_DESC,
    });

    const result = await verifyEmailAction("1234567890abcdef");

    expect(authPortsMock.verifyEmail).toHaveBeenCalledWith("1234567890abcdef");
    expect(result).toMatchObject({
      isSuccess: true,
      message: VERIFY_EMAIL_CLIENT.SUCCESS_DESC,
    });
  });

  it("returns a generic error when the verification token is invalid", async () => {
    authPortsMock.verifyEmail.mockResolvedValue({
      errors: [{ message: "Invalid token" }],
      isSuccess: false,
      message: "Invalid token",
    });

    const result = await verifyEmailAction("1234567890abcdef");

    expect(result).toMatchObject({
      isSuccess: false,
      message: VERIFY_EMAIL_CLIENT.ERROR_DESC,
    });
  });
});
