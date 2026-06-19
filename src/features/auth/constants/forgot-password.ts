import { PUBLIC_ROUTES } from "@/constants/routes";

export const FORGOT_PASSWORD_CONST = {
  FORM_ID: "forgot-password-form",
} as const;

export const FORGOT_PASSWORD_CLIENT = {
  FORM_TITLE: "Reset your password",
  FORM_DESC: "Enter your work email and we will send a secure reset link.",

  EMAIL_LABEL: "Work Email",
  EMAIL_PLACEHOLDER: "name@organization.com",
  VALIDATION_EMAIL_ERROR: "Please enter a valid work email.",

  FALLBACK_SERVER_ERROR: "Could not send a reset link. Please try again.",
  SUCCESS_TITLE: "Check your email",
  SUCCESS_DESC: "If an account exists for that email, a reset link is on the way.",

  SUBMIT_LABEL: "Send Reset Link",
  PENDING_LABEL: "Sending...",

  SIGNIN_PROMPT: "Remembered your password?",
  SIGNIN_CTA: "Sign in",
  SIGNIN_HREF: PUBLIC_ROUTES.SIGNIN,
} as const;
