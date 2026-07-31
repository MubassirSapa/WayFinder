import { PUBLIC_ROUTES } from "@/constants/routes";

export const SIGNIN_CONST = {
  FORM_ID: "signin-form",
} as const;

export const SIGNIN_CLIENT = {
  FORM_TITLE: "Sign in to Wayfinder",
  FORM_DESC: "Open your organization workspace and continue building accessible indoor routes.",

  EMAIL_LABEL: "Work Email",
  EMAIL_PLACEHOLDER: "name@organization.com",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "Enter your password",

  VALIDATION_EMAIL_ERROR: "Please enter a valid work email.",
  VALIDATION_PASSWORD_REQUIRED: "Please enter your password.",

  WRONG_CREDENTIALS: "The email or password is incorrect.",
  FALLBACK_SERVER_ERROR: "Could not sign in. Please try again.",

  SUBMIT_LABEL: "Sign In",
  PENDING_LABEL: "Signing in...",

  FORGOT_PROMPT: "Forgot password?",
  FORGOT_CTA: "Reset it",
  SIGNUP_PROMPT: "New to Wayfinder?",
  SIGNUP_CTA: "Register your organization",
  FORGOT_HREF: PUBLIC_ROUTES.FORGOT_PASSWORD,
  SIGNUP_HREF: PUBLIC_ROUTES.REGISTER_ORGANIZATION,
} as const;
