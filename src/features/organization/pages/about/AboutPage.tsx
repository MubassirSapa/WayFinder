import { OrganizationAboutContent } from "@/features/organization/components/OrganizationAboutContent";
import { OrganizationSiteFooter } from "@/features/organization/components/OrganizationSiteFooter";
import { OrganizationSiteHeader } from "@/features/organization/components/OrganizationSiteHeader";

export function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <OrganizationSiteHeader />
      <main className="flex-1">
        <OrganizationAboutContent />
      </main>
      <OrganizationSiteFooter />
    </div>
  );
}
