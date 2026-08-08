import type { Metadata } from "next";

import { PublicVenuesPage } from "@/features/viewer/pages/venues/PublicVenuesPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Indoor Maps | Wayfinder",
  description: "Search public buildings, choose a floor, and open its indoor map.",
};

type BuildingsPageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function BuildingsPage({ searchParams }: BuildingsPageProps) {
  const { view } = await searchParams;

  return <PublicVenuesPage initialView={view === "recent" ? "recent" : "all"} />;
}
