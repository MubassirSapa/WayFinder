import Link from "next/link";
import { Building2, Compass, Layers3, MapPinned, Route } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PublicSiteFooter } from "@/features/public-landing/components/PublicSiteFooter";
import { PublicSiteHeader } from "@/features/public-landing/components/PublicSiteHeader";
import { cn } from "@/lib/utils";

const principles = [
  {
    title: "Venue-first maps",
    description:
      "Wayfinder organizes each organization around buildings, floors, rooms, and searchable destinations.",
    icon: Building2,
  },
  {
    title: "Maintainable floor plans",
    description:
      "Teams can keep indoor maps updated without rebuilding the entire experience whenever a floor changes.",
    icon: Layers3,
  },
  {
    title: "Simple navigation",
    description:
      "Visitors should be able to search a destination, understand the floor, and follow a clear route.",
    icon: Route,
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSiteHeader activePage="about" />

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              About Wayfinder
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Indoor maps that are practical for real buildings.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Wayfinder helps organizations publish indoor maps that visitors can search and teams
              can maintain. The goal is straightforward: make buildings easier to understand before
              someone gets lost inside them.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")} href="/signup">
                Register your organization
              </Link>
              <Link
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-4")}
                href="/"
              >
                Explore venues
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MapPinned className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Map model</p>
                <p className="font-semibold text-card-foreground">Organization to editor</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <PathStep label="Owner" />
              <PathStep label="Organization" />
              <PathStep label="Buildings" />
              <PathStep label="Floors" />
              <PathStep label="Map editor" isLast />
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-3">
            {principles.map((item) => (
              <article className="rounded-md border border-border bg-card p-5" key={item.title}>
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-card-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12">
          <div className="rounded-md border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <Compass className="size-4" aria-hidden />
                  <span className="text-sm font-semibold">Built for facilities</span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Hospitals, campuses, malls, offices, libraries, and other public venues can use
                  the same structure: one organization, many buildings, many floors, and one editor
                  workflow for keeping maps accurate.
                </p>
              </div>
              <Link className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")} href="/signup">
                Get started
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  );
}

function PathStep({ label, isLast = false }: { label: string; isLast?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="flex flex-col items-center">
        <span className="mt-1 size-2 rounded-full bg-primary" />
        {!isLast ? <span className="mt-1 h-5 w-px bg-border" /> : null}
      </span>
      <span>{label}</span>
    </div>
  );
}
