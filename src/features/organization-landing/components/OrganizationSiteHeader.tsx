import { SiteHeader } from "@/components/shared/public-site/SiteHeader";
import { PUBLIC_ROUTES } from "@/constants/routes";

const organizationLinks = [
  { label: "About", href: PUBLIC_ROUTES.ORGANIZATION_ABOUT },
  { label: "Public maps", href: PUBLIC_ROUTES.HOME },
] as const;

export function OrganizationSiteHeader() {
  return (
    <SiteHeader
      brandHref={PUBLIC_ROUTES.ORGANIZATION}
      links={organizationLinks}
      navigationLabel="Organization navigation"
    />
  );
}
