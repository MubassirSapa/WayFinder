import type { Metadata } from "next";

import { PublicLandingPage } from "@/features/public-landing/pages/home/PublicLandingPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wayfinder | Indoor Maps",
  description: "Search and explore indoor maps for public venues and facilities.",
};

export default function HomePage() {
  return <PublicLandingPage />;
}
