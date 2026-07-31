import { PublicSiteFooter } from "@/components/shared/public-site/PublicSiteFooter";
import { PublicSiteHeader } from "@/features/viewer/components/PublicSiteHeader";
import { ViewerAboutContent } from "@/features/viewer/components/ViewerAboutContent";

export function ViewerAboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicSiteHeader activePage="about" />
      <main className="flex-1">
        <ViewerAboutContent />
      </main>
      <PublicSiteFooter />
    </div>
  );
}
