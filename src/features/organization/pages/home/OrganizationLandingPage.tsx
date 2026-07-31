import { OrganizationCapabilities } from "@/features/organization/components/OrganizationCapabilities";
import { OrganizationBuildingVisual } from "@/features/organization/components/OrganizationBuildingVisual";
import { OrganizationCta } from "@/features/organization/components/OrganizationCta";
import { OrganizationHero } from "@/features/organization/components/OrganizationHero";
import { OrganizationSiteFooter } from "@/features/organization/components/OrganizationSiteFooter";
import { OrganizationSiteHeader } from "@/features/organization/components/OrganizationSiteHeader";

export function OrganizationLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <OrganizationSiteHeader />
      <main className="flex-1">
        <OrganizationHero />
        <OrganizationBuildingVisual />
        <section className="border-b border-border bg-muted/20">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-12 lg:py-16">
            <OrganizationCta variant="compact" />
            <OrganizationCapabilities />
          </div>
        </section>
      </main>
      <OrganizationSiteFooter />
    </div>
  );
}
