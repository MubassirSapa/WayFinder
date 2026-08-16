import { OrganizationContactContent } from "@/features/organization/components/OrganizationContactContent";
import { OrganizationSiteShell } from "@/features/organization/components/OrganizationSiteShell";

export function ContactPage() {
  return (
    <OrganizationSiteShell activePage="contact">
      <OrganizationContactContent />
    </OrganizationSiteShell>
  );
}
