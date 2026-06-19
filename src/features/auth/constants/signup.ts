export const SIGNUP_CLIENT = {
  FORM_TITLE: "Create Your Account",
  FORM_DESC: "Join your organization on Wayfinder.",

  NAME_LABEL: "Full Name",
  NAME_PLACEHOLDER: "John Doe",
  EMAIL_LABEL: "Work Email",
  EMAIL_PLACEHOLDER: "name@company.com",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "Create a strong password",
  CONFIRM_PASSWORD_LABEL: "Confirm Password",
  CONFIRM_PASSWORD_PLACEHOLDER: "Repeat your password",

  TERMS_PREFIX: "I agree to the",
  TERMS_LINK: "Terms",
  TERMS_AND: "and",
  PRIVACY_LINK: "Privacy Policy",

  SUBMIT_LABEL: "Create Account",
  PENDING_LABEL: "Creating account...",

  SIGNIN_PROMPT: "Already have an account?",
  SIGNIN_CTA: "Log in",

  VALIDATION_NAME_ERROR: "Please enter your full name.",
  VALIDATION_EMAIL_ERROR: "Please enter a valid work email.",
  VALIDATION_PASSWORD_MIN: "The password must be at least 8 characters.",
  VALIDATION_PASSWORD_STRENGTH:
    "The password needs uppercase, lowercase, number, and special character.",
  VALIDATION_CONFIRM_MISMATCH: "The passwords do not match.",
  VALIDATION_TERMS_REQUIRED: "You must agree to the Terms and Privacy Policy.",

  MISSING_ORGANIZATION:
    "Please register your organization first.",
  EMAIL_TAKEN: "An account with this email already exists. Please log in instead.",
  FALLBACK_SERVER_ERROR: "Could not create your account. Please try again.",
} as const;
