const PUBLIC_ROUTES = {
  HOME: "/",
  DISCOVER: "/#venues",
  VENUES: "/venues",
  VENUES_RECENT: "/venues?view=recent",
  ABOUT: "/about",

  MAP: "/map",
  ORGANIZATION: "/organization",
  ORGANIZATION_ABOUT: "/organization/about",

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
  DASHBOARD: "/dashboard",
  ORGANIZATION: "/dashboard/organization",
  BUILDINGS: "/dashboard/buildings",
  USERS: "/dashboard/users",
  PROFILE: "/dashboard/profile",
  EDITOR: "/editor",
} as const;

export { PUBLIC_ROUTES, PRIVATE_ROUTES };
