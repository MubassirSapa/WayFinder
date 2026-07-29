import type { Metadata } from "next";

import { AboutPage } from "@/features/organization-landing/pages/about/AboutPage";

export const metadata: Metadata = {
  title: "About Wayfinder for Organizations | Wayfinder",
  description:
    "Learn how Wayfinder helps organizations keep indoor maps current and make routes easier for every visitor to understand.",
};

export default function OrganizationAboutRoute() {
  return <AboutPage />;
}
