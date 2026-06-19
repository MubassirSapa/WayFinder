const PUBLIC_ROUTES = {
  HOME: "/",

  SIGNIN: "/signin",
  SIGNUP: "/signup",
  REGISTER_ORGANIZATION: "/register-organization",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  CHECK_EMAIL: "/check-email",
  VERIFY_EMAIL: "/verify-email",
  TERMS: "/terms",
  PRIVACY: "/privacy",
} as const;

const PRIVATE_ROUTES = {
  EDITOR: "/editor",
} as const;

export { PUBLIC_ROUTES, PRIVATE_ROUTES };
