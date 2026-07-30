import { SiteHeader } from "@/components/shared/public-site/SiteHeader";

type PublicSiteHeaderProps = {
  activePage?: "discover";
};

const publicLinks = [
  { label: "Discover", href: "/" },
  { label: "Venues", href: "/#venues" },
] as const;

export function PublicSiteHeader({ activePage }: PublicSiteHeaderProps) {
  return (
    <SiteHeader
      activeHref={activePage === "discover" ? "/" : undefined}
      brandHref="/"
      links={publicLinks}
      navigationLabel="Public navigation"
    />
  );
}
