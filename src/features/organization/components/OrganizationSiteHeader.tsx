import { SiteHeader } from "@/components/shared/public-site/SiteHeader";
import { PUBLIC_ROUTES } from "@/constants/routes";

const organizationLinks = [
  { label: "About", href: PUBLIC_ROUTES.ORGANIZATION_ABOUT },
  { label: "Contact", href: PUBLIC_ROUTES.ORGANIZATION_CONTACT },
] as const;

type OrganizationSiteHeaderProps = {
  activePage?: "about" | "contact";
  showRegistrationAction?: boolean;
};

const registrationLink = {
  label: "Get started",
  href: PUBLIC_ROUTES.REGISTER_ORGANIZATION,
  variant: "primary",
} as const;

const activeHrefByPage: Record<"about" | "contact", string> = {
  about: PUBLIC_ROUTES.ORGANIZATION_ABOUT,
  contact: PUBLIC_ROUTES.ORGANIZATION_CONTACT,
};

export function OrganizationSiteHeader({
  activePage,
  showRegistrationAction = true,
}: OrganizationSiteHeaderProps) {
  const links = showRegistrationAction
    ? [...organizationLinks, registrationLink]
    : organizationLinks;

  return (
    <SiteHeader
      activeHref={activePage ? activeHrefByPage[activePage] : undefined}
      brandHref={PUBLIC_ROUTES.ORGANIZATION}
      links={links}
      navigationLabel="Organization navigation"
    />
  );
}
