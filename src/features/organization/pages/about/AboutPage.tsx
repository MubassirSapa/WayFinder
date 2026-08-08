import { OrganizationAboutContent } from "@/features/organization/components/OrganizationAboutContent";
import { OrganizationSiteShell } from "@/features/organization/components/OrganizationSiteShell";

export function AboutPage() {
  return (
    <OrganizationSiteShell activePage="about">
      <OrganizationAboutContent />
    </OrganizationSiteShell>
  );
}
