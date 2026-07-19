import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Compass,
  Layers3,
  LayoutDashboard,
  Pencil,
  Route,
  Search,
  Users,
} from "lucide-react";

import { PublicSiteFooter } from "@/components/shared/public-site/PublicSiteFooter";
import { buttonVariants } from "@/components/ui/button";
import { PublicSiteHeader } from "@/features/public-landing/components/PublicSiteHeader";
import { cn } from "@/lib/utils";

const audienceCards = [
  {
    title: "Visitors, students, and customers",
    description:
      "Search for a room, department, or point of interest and understand which floor to use before starting the route.",
    icon: Search,
  },
  {
    title: "Building owners and admins",
    description:
      "Manage the organization, building, and floor data from one dashboard. Make floors available only when they are ready.",
    icon: LayoutDashboard,
  },
  {
    title: "Staff teams",
    description:
      "Keep indoor directions current when room names, routes, or floor layouts change.",
    icon: Users,
  },
];

const workflowSteps = [
  {
    label: "01",
    title: "Create an organization",
    description:
      "The owner signs up, verifies their email, and sets up the organization workspace.",
    icon: Users,
  },
  {
    label: "02",
    title: "Set up one building",
    description:
      "Each organization manages one physical building, including its name and venue type.",
    icon: Building2,
  },
  {
    label: "03",
    title: "Add multiple floors",
    description:
      "A building can contain many floors. Each floor can be prepared and managed separately.",
    icon: Layers3,
  },
  {
    label: "04",
    title: "Open the editor",
    description:
      "The editor is where the floor plan, places, and routes are maintained for navigation.",
    icon: Pencil,
  },
  {
    label: "05",
    title: "Make the map available",
    description:
      "When a floor is ready, it can appear on the public page for people to search and use.",
    icon: Route,
  },
];

const reasons = [
  {
    title: "Less confusion",
    description:
      "People can check where they are going before they reach the building or while they are inside it.",
  },
  {
    title: "Cleaner operations",
    description:
      "Admins keep the public map connected to the same floor data they manage in the dashboard.",
  },
  {
    title: "Mobile friendly",
    description:
      "The public experience is designed around quick searches, readable cards, and simple actions on small screens.",
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSiteHeader activePage="about" />

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[length:60px_60px] opacity-10 [mask-image:radial-gradient(80%_80%_at_50%_10%,var(--mask-opaque),transparent_72%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Compass className="size-3.5 text-primary" aria-hidden />
                About Wayfinder
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
                Indoor maps that make buildings easier to navigate.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Wayfinder gives building owners a simple way to manage floor maps, while visitors
                get a clear public experience for finding rooms, services, and points of interest.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")} href="/signup">
                  Register your venue
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-4")}
                  href="/#venues"
                >
                  Explore venues
                </Link>
              </div>
            </div>

            <div className="rounded-md border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Building2 className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">App structure</p>
                  <p className="font-semibold text-card-foreground">From owner to editor</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <ModelRow label="Owner" value="Creates organization" />
                <ModelRow label="Organization" value="Manages one building" />
                <ModelRow label="Building" value="Contains many floors" />
                <ModelRow label="Floor" value="Opens in editor" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Who it helps
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
              One map system for the people using and maintaining the building.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {audienceCards.map((card) => (
              <article className="rounded-md border border-border bg-card p-5" key={card.title}>
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <card.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-card-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:py-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Workflow
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
                How Wayfinder is organized.
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                The structure stays focused so the product is easier to maintain: one organization,
                one building, many floors, and editor access for each floor.
              </p>
            </div>

            <div className="grid gap-3">
              {workflowSteps.map((step) => (
                <article
                  className="grid gap-4 rounded-md border border-border bg-card p-5 sm:grid-cols-[72px_1fr] sm:items-start"
                  key={step.label}
                >
                  <div className="flex items-center gap-3 sm:block">
                    <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <step.icon className="size-5" aria-hidden />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:mt-3 sm:block">
                      Step {step.label}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {reasons.map((reason, index) => (
              <article
                className="relative overflow-hidden rounded-md border border-border bg-card p-5"
                key={reason.title}
              >
                <span className="absolute right-4 top-2 text-6xl font-semibold text-primary/10">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="relative text-lg font-semibold text-card-foreground">
                  {reason.title}
                </h3>
                <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
                  {reason.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-md border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <Compass className="size-4" aria-hidden />
                  <span className="text-sm font-semibold">Ready for the demo flow</span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Start with organization registration, verify the owner email, then manage building
                  floors from the private dashboard.
                </p>
              </div>
              <Link
                className={cn(buttonVariants({ size: "lg" }), "h-10 px-4 sm:shrink-0")}
                href="/signup"
              >
                Start setup
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  );
}

function ModelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background/60 px-3 py-3">
      <span className="text-sm font-medium text-card-foreground">{label}</span>
      <span className="text-right text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
