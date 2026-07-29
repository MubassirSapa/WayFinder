import Link from "next/link";

import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type PublicSiteFooterGroup = {
  title: string;
  links: readonly {
    label: string;
    href: string;
  }[];
};

type PublicSiteFooterProps = {
  brandHref?: string;
  description?: string;
  groups?: readonly PublicSiteFooterGroup[];
};

const defaultFooterGroups = [
  {
    title: "Explore",
    links: [
      { label: "Discover", href: PUBLIC_ROUTES.HOME },
      { label: "Venues", href: `${PUBLIC_ROUTES.HOME}#venues` },
    ],
  },
  {
    title: "Organization",
    links: [
      { label: "For organizations", href: PUBLIC_ROUTES.ORGANIZATION },
      { label: "About", href: PUBLIC_ROUTES.ORGANIZATION_ABOUT },
      { label: "Join now", href: PUBLIC_ROUTES.REGISTER_ORGANIZATION },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: PUBLIC_ROUTES.PRIVACY },
      { label: "Terms of Service", href: PUBLIC_ROUTES.TERMS },
    ],
  },
];

export function PublicSiteFooter({
  brandHref = "/",
  description = "Indoor maps and wayfinding for public venues. Search any building, choose the right floor, and route to the right door.",
  groups = defaultFooterGroups,
}: PublicSiteFooterProps = {}) {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[length:56px_56px] opacity-15 [mask-image:radial-gradient(80%_120%_at_50%_0%,var(--mask-opaque),transparent_72%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-9 px-5 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-14 lg:py-12">
        <div>
          <WayfinderBrand href={brandHref} />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-9 md:grid-cols-[repeat(3,max-content)] md:gap-x-12 lg:gap-x-16">
          {groups.map((group, index) => (
            <div
              className={cn(
                "justify-self-center text-center md:justify-self-start md:text-left",
                groups.length === 3 &&
                  index === 2 &&
                  "col-span-2 md:col-span-1",
              )}
              key={group.title}
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">
                {group.title}
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                {group.links.map((link) => (
                  <Link
                    className="text-muted-foreground transition hover:text-foreground"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </footer>
  );
}
