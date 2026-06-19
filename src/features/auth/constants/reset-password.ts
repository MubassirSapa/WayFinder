import { PUBLIC_ROUTES } from "@/constants/routes";

export const RESET_PASSWORD_CONST = {
  FORM_ID: "reset-password-form",
} as const;

export const RESET_PASSWORD_CLIENT = {
  FORM_TITLE: "Create a new password",
  FORM_DESC: "Choose a strong password before returning to your workspace.",

  PASSWORD_LABEL: "New Password",
  PASSWORD_PLACEHOLDER: "Create a strong password",
  CONFIRM_PASSWORD_LABEL: "Confirm Password",
  CONFIRM_PASSWORD_PLACEHOLDER: "Repeat your password",

  VALIDATION_PASSWORD_MIN: "The password must be at least 8 characters.",
  VALIDATION_PASSWORD_STRENGTH:
    "The password needs uppercase, lowercase, number, and special character.",
  VALIDATION_CONFIRM_REQUIRED: "Please confirm your password.",
  VALIDATION_CONFIRM_MISMATCH: "The passwords do not match.",
  VALIDATION_TOKEN_ERROR: "This reset link is invalid or expired.",

  FALLBACK_SERVER_ERROR: "Could not reset your password. Please try again.",
  SUCCESS_TITLE: "Password updated",
  SUCCESS_DESC: "Your new password is ready. You can sign in now.",

  SUBMIT_LABEL: "Update Password",
  PENDING_LABEL: "Updating...",

  SIGNIN_CTA: "Go to Sign In",
  SIGNIN_HREF: PUBLIC_ROUTES.SIGNIN,
} as const;
