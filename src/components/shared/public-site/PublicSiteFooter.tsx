import Link from "next/link";
import { Compass } from "lucide-react";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Discover", href: "/" },
      { label: "Venues", href: "/#venues" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Owners",
    links: [
      { label: "Register venue", href: "/signup" },
      { label: "Log in", href: "/signin" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function PublicSiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[length:56px_56px] opacity-15 [mask-image:radial-gradient(80%_120%_at_50%_0%,#000,transparent_72%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-9 px-5 py-10 sm:px-6 md:grid-cols-[1.2fr_1.8fr] lg:py-12">
        <div>
          <Link className="inline-flex items-center gap-2 font-semibold text-primary" href="/">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Compass className="size-4" aria-hidden />
            </span>
            <span>Wayfinder</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Indoor maps and wayfinding for public venues. Search any building, choose the right
            floor, and route to the right door.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-7 min-[420px]:grid-cols-2 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
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

      <div className="relative border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{year} Wayfinder. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
            Public navigation ready
          </p>
        </div>
      </div>
    </footer>
  );
}
