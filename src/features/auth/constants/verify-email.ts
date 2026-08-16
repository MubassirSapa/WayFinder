import { BRAND } from "@/constants/brand";

export const VERIFY_EMAIL_CLIENT = {
  SUCCESS_TITLE: "Email Verified",
  SUCCESS_DESC: `Your email is verified. ${BRAND.NAME} is now reviewing your organization — we'll email you as soon as you're approved. Questions in the meantime? Reach us at ${BRAND.SUPPORT_EMAIL}.`,

  ERROR_TITLE: "Verification Failed",
  ERROR_DESC: "The verification link is invalid or has expired. Please sign up again or contact support.",

  SIGNIN_CTA: "Go to Sign In",
  HOME_CTA: "Back to Home",
} as const;
