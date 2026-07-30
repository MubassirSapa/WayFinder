import { OrganizationAboutContent } from "@/features/organization-landing/components/OrganizationAboutContent";
import { OrganizationSiteFooter } from "@/features/organization-landing/components/OrganizationSiteFooter";
import { OrganizationSiteHeader } from "@/features/organization-landing/components/OrganizationSiteHeader";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <OrganizationSiteHeader />
      <main>
        <OrganizationAboutContent />
      </main>
      <OrganizationSiteFooter />
    </div>
  );
}
