import type { Metadata } from "next";

import { AboutPage } from "@/features/public-landing/pages/about/AboutPage";

export const metadata: Metadata = {
  title: "About | Wayfinder",
  description: "Learn how Wayfinder organizes indoor maps for buildings, floors, and venues.",
};

export default function AboutRoute() {
  return <AboutPage />;
}
