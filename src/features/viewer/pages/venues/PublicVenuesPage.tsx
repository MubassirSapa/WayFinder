import { PublicSiteFooter } from "@/components/shared/public-site/PublicSiteFooter";
import { PublicSiteHeader } from "@/features/viewer/components/PublicSiteHeader";
import { getPublicLandingData } from "@/features/viewer/services/getPublicLandingData";

import { VenueDirectory } from "./VenueDirectory";

import type { VenueDirectoryView } from "./VenueDirectory";

type PublicVenuesPageProps = {
  initialView: VenueDirectoryView;
};

export async function PublicVenuesPage({ initialView }: PublicVenuesPageProps) {
  const data = await getPublicLandingData();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicSiteHeader activePage="venues" />
      <main className="flex-1">
        <VenueDirectory data={data} view={initialView} />
      </main>
      <PublicSiteFooter />
    </div>
  );
}
