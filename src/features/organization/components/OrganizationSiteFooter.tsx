import { PublicSiteFooter } from "@/components/shared/public-site/PublicSiteFooter";
import { PUBLIC_ROUTES } from "@/constants/routes";

export function OrganizationSiteFooter() {
  return (
    <PublicSiteFooter
      brandHref={PUBLIC_ROUTES.ORGANIZATION}
      description="Simple tools for creating, maintaining, and sharing accessible indoor maps."
    />
  );
}
