import { describe, expect, it } from "vitest";

import { OrganizationSchema } from "@/features/auth/validations/organization";
import { ResetPasswordSchema } from "@/features/auth/validations/reset-password";
import { SigninSchema } from "@/features/auth/validations/signin";
import { SignupActionSchema, SignupSchema } from "@/features/auth/validations/signup";
import { TokenSchema } from "@/features/auth/validations/token";

const strongPassword = "Strong123!";

describe("auth validation schemas", () => {
  it("accepts a complete signup form payload", () => {
    const result = SignupSchema.safeParse({
      name: "Mubassir Sapa",
      email: "mubassir@example.com",
      password: strongPassword,
      confirmPassword: strongPassword,
      agreedToTerms: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects signup when passwords do not match", () => {
    const result = SignupSchema.safeParse({
      name: "Mubassir Sapa",
      email: "mubassir@example.com",
      password: strongPassword,
      confirmPassword: "Different123!",
      agreedToTerms: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("confirmPassword");
    }
  });

  it("rejects signup when terms are missing", () => {
    const result = SignupSchema.safeParse({
      name: "Mubassir Sapa",
      email: "mubassir@example.com",
      password: strongPassword,
      confirmPassword: strongPassword,
      agreedToTerms: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("agreedToTerms");
    }
  });

  it("requires a strong password for signup and reset password", () => {
    const signupResult = SignupSchema.safeParse({
      name: "Mubassir Sapa",
      email: "mubassir@example.com",
      password: "password",
      confirmPassword: "password",
      agreedToTerms: true,
    });
    const resetResult = ResetPasswordSchema.safeParse({
      password: "password",
      confirmPassword: "password",
    });

    expect(signupResult.success).toBe(false);
    expect(resetResult.success).toBe(false);
  });

  it("validates organization information for signup actions", () => {
    expect(
      OrganizationSchema.safeParse({
        name: "St. Helen Medical Center",
        type: "hospital",
      }).success,
    ).toBe(true);

    expect(
      SignupActionSchema.safeParse({
        name: "Mubassir Sapa",
        email: "mubassir@example.com",
        password: strongPassword,
        organization: {
          name: "A",
          type: "unknown",
        },
      }).success,
    ).toBe(false);
  });

  it("validates sign in and token payloads", () => {
    expect(
      SigninSchema.safeParse({
        email: "owner@example.com",
        password: "anything",
      }).success,
    ).toBe(true);

    expect(SigninSchema.safeParse({ email: "bad-email", password: "" }).success).toBe(false);
    expect(TokenSchema.safeParse({ token: "short" }).success).toBe(false);
    expect(TokenSchema.safeParse({ token: "1234567890abcdef" }).success).toBe(true);
  });
});
