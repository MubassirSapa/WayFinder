import { PublicSiteFooter } from "@/features/public-landing/components/PublicSiteFooter";
import { PublicSiteHeader } from "@/features/public-landing/components/PublicSiteHeader";
import { getPublicLandingData } from "@/features/public-landing/services/getPublicLandingData";
import { LandingExplorer } from "./LandingExplorer";

export async function PublicLandingPage() {
  const data = await getPublicLandingData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSiteHeader activePage="discover" />

      <main id="venues">
        <LandingExplorer data={data} />
      </main>

      <PublicSiteFooter />
    </div>
  );
}
