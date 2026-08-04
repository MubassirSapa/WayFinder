import { SiteHeader } from "@/components/shared/public-site/SiteHeader";
import { PUBLIC_ROUTES } from "@/constants/routes";

const organizationLinks = [{ label: "About", href: PUBLIC_ROUTES.ORGANIZATION_ABOUT }] as const;

type OrganizationSiteHeaderProps = {
  showRegistrationAction?: boolean;
};

const registrationLink = {
  label: "Get started",
  href: PUBLIC_ROUTES.REGISTER_ORGANIZATION,
  variant: "primary",
} as const;

export function OrganizationSiteHeader({
  showRegistrationAction = true,
}: OrganizationSiteHeaderProps) {
  const links = showRegistrationAction
    ? [...organizationLinks, registrationLink]
    : organizationLinks;

  return (
    <SiteHeader
      brandHref={PUBLIC_ROUTES.ORGANIZATION}
      links={links}
      navigationLabel="Organization navigation"
    />
  );
}
