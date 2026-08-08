import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";
import { SmoothHashLink } from "@/components/shared/public-site/SmoothHashLink";
import { PUBLIC_ROUTES } from "@/constants/routes";

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
      { label: "Home", href: PUBLIC_ROUTES.DISCOVER },
      { label: "Buildings", href: PUBLIC_ROUTES.BUILDINGS },
      { label: "About", href: PUBLIC_ROUTES.ABOUT },
    ],
  },
  {
    title: "Organization",
    links: [
      { label: "Overview", href: PUBLIC_ROUTES.ORGANIZATION },
      { label: "About", href: PUBLIC_ROUTES.ORGANIZATION_ABOUT },
      { label: "Get started", href: PUBLIC_ROUTES.REGISTER_ORGANIZATION },
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
  description = "Find your way inside any public building. Search for a building, choose the right floor, and get clear directions to your destination.",
  groups = defaultFooterGroups,
}: PublicSiteFooterProps = {}) {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[56px_56px] opacity-15 mask-[radial-gradient(80%_120%_at_50%_0%,var(--mask-opaque),transparent_72%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-9 px-5 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-14 lg:py-12">
        <div>
          <WayfinderBrand href={brandHref} />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-9 md:grid-cols-[repeat(3,max-content)] md:gap-x-12 lg:gap-x-16">
          {groups.map((group) => (
            <div className="justify-self-start text-left" key={group.title}>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">
                {group.title}
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                {group.links.map((link) => (
                  <SmoothHashLink
                    className="text-muted-foreground transition hover:text-foreground"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </SmoothHashLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
