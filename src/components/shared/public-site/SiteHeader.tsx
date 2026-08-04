import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";
import { MobileSiteMenu } from "@/components/shared/public-site/MobileSiteMenu";
import { SmoothHashLink } from "@/components/shared/public-site/SmoothHashLink";
import { ModeToggle } from "@/components/shared/theme/ModeToggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SiteHeaderLink = {
  label: string;
  href: string;
  variant?: "default" | "primary";
};

type SiteHeaderProps = {
  brandHref: string;
  links: readonly SiteHeaderLink[];
  activeHref?: string;
  navigationLabel: string;
};

export function SiteHeader({
  brandHref,
  links,
  activeHref,
  navigationLabel,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <nav
        aria-label={navigationLabel}
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6"
      >
        <WayfinderBrand href={brandHref} />

        <div className="ml-auto hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          {links.map((link) => (
            <SmoothHashLink
              aria-current={activeHref === link.href ? "page" : undefined}
              className={cn(
                link.variant === "primary"
                  ? cn(buttonVariants({ size: "lg" }), "h-9 px-4 text-sm")
                  : "transition-colors hover:text-foreground",
                link.variant !== "primary" && activeHref === link.href && "text-foreground",
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </SmoothHashLink>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <ModeToggle />
          <MobileSiteMenu
            activeHref={activeHref}
            links={links}
            navigationLabel={navigationLabel}
          />
        </div>
      </nav>
    </header>
  );
}
