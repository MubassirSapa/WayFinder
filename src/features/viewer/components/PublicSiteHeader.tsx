import { SiteHeader } from "@/components/shared/public-site/SiteHeader";
import { PUBLIC_ROUTES } from "@/constants/routes";

type PublicSiteHeaderProps = {
  activePage?: "about" | "discover" | "buildings";
};

const publicLinks = [
  { label: "Home", href: PUBLIC_ROUTES.DISCOVER },
  { label: "Buildings", href: PUBLIC_ROUTES.BUILDINGS },
  { label: "About", href: PUBLIC_ROUTES.ABOUT },
  { label: "Organization", href: PUBLIC_ROUTES.ORGANIZATION },
] as const;

export function PublicSiteHeader({ activePage }: PublicSiteHeaderProps) {
  return (
    <SiteHeader
      activeHref={
        activePage === "discover"
          ? PUBLIC_ROUTES.DISCOVER
          : activePage === "buildings"
            ? PUBLIC_ROUTES.BUILDINGS
            : activePage === "about"
              ? PUBLIC_ROUTES.ABOUT
              : undefined
      }
      brandHref="/"
      links={publicLinks}
      navigationLabel="Public navigation"
    />
  );
}
