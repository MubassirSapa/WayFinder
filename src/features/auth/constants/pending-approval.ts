import { BRAND } from "@/constants/brand";

export const PENDING_APPROVAL_CLIENT = {
  TITLE: (organizationName: string) => `${organizationName} is pending review`,
  DESC: "We're reviewing your signup. You'll get an email as soon as you're approved and can start using the dashboard.",
  CONTACT: `Questions in the meantime? Reach us at ${BRAND.SUPPORT_EMAIL}.`,

  SIGNOUT_CTA: "Sign Out",
} as const;
