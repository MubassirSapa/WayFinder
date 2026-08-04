import type { Metadata } from "next";

import { PublicLandingPage } from "@/features/viewer/pages/home/PublicLandingPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find Indoor Maps | Wayfinder",
  description: "Search available venues and open an indoor map to find your destination.",
};

export default function HomePage() {
  return <PublicLandingPage />;
}
