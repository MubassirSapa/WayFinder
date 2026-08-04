import { PublicSiteFooter } from "@/components/shared/public-site/PublicSiteFooter";
import { PublicSiteHeader } from "@/features/viewer/components/PublicSiteHeader";
import { getPublicLandingData } from "@/features/viewer/services/getPublicLandingData";
import { LandingExplorer } from "./LandingExplorer";

export async function PublicLandingPage() {
  const data = await getPublicLandingData();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicSiteHeader activePage="discover" />

      <main className="flex-1">
        <LandingExplorer data={data} />
      </main>

      <PublicSiteFooter />
    </div>
  );
}
