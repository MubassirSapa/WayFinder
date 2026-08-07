import { SiteHeader } from "@/components/shared/public-site/SiteHeader";
import { PUBLIC_ROUTES } from "@/constants/routes";

type PublicSiteHeaderProps = {
  activePage?: "about" | "discover" | "venues";
};

const publicLinks = [
  { label: "Home", href: PUBLIC_ROUTES.DISCOVER },
  { label: "Venues", href: PUBLIC_ROUTES.VENUES },
  { label: "About", href: PUBLIC_ROUTES.ABOUT },
] as const;

export function PublicSiteHeader({ activePage }: PublicSiteHeaderProps) {
  return (
    <SiteHeader
      activeHref={
        activePage === "discover"
          ? PUBLIC_ROUTES.DISCOVER
          : activePage === "venues"
            ? PUBLIC_ROUTES.VENUES
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
