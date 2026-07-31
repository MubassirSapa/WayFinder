import type { Metadata } from "next";

import { OrganizationLandingPage } from "@/features/organization/pages/home/OrganizationLandingPage";

export const metadata: Metadata = {
  title: "Indoor Mapping for Organizations | Wayfinder",
  description:
    "Create, maintain, and share accessible indoor maps that help visitors navigate your building with confidence.",
};

export default function OrganizationRoute() {
  return <OrganizationLandingPage />;
}
