import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Building2, CircleCheck, FileText, ShieldAlert, UserCheck } from "lucide-react";

import { PublicSiteFooter } from "@/components/shared/public-site/PublicSiteFooter";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { PublicSiteHeader } from "@/features/public-landing/components/PublicSiteHeader";
import { cn } from "@/lib/utils";

const termCards = [
  {
    title: "Use the platform responsibly",
    description:
      "Wayfinder is for authorized indoor mapping, building management, and public wayfinding work.",
    icon: UserCheck,
  },
  {
    title: "Keep map data accurate",
    description:
      "Owners are responsible for the rooms, floors, routes, and points of interest they add.",
    icon: Building2,
  },
  {
    title: "Respect access",
    description:
      "Do not try to access organizations, editor routes, accounts, or data you are not allowed to use.",
    icon: ShieldAlert,
  },
  {
    title: "Use permitted content",
    description:
      "Only upload or manage floor plans, labels, and map content you have permission to use.",
    icon: CircleCheck,
  },
];

export const metadata: Metadata = {
  title: `Terms of Service | ${BRAND.NAME}`,
  description: `Terms for using ${BRAND.NAME} accounts, dashboards, and indoor map tools.`,
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[60px_60px] opacity-10 mask-[radial-gradient(80%_80%_at_50%_10%,#000,transparent_72%)]" />
          <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <FileText className="size-3.5 text-primary" aria-hidden />
              Terms
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              These terms describe the expected use of {BRAND.NAME} accounts, organization
              dashboards, map editor tools, and public indoor map pages.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: June 19, 2026</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-4 md:grid-cols-2">
            {termCards.map((card) => (
              <article className="rounded-md border border-border bg-card p-5" key={card.title}>
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <card.icon className="size-5" aria-hidden />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-card-foreground">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-md border border-border bg-card p-6 sm:p-8">
              <div className="space-y-8">
                <LegalBlock title="Accounts and organizations">
                  By creating an account, you agree to provide accurate information and to keep your
                  login credentials secure. One organization is used to manage one building and its
                  related floors.
                </LegalBlock>
                <LegalBlock title="Map content">
                  You are responsible for the floor plans, labels, routes, and points of interest
                  entered into the system. Do not add content that is misleading, unsafe, or not
                  yours to manage.
                </LegalBlock>
                <LegalBlock title="Availability">
                  Wayfinder may change as the project develops. Features, routes, and dashboard
                  tools can be updated as the product improves.
                </LegalBlock>
                <LegalBlock title="Misuse">
                  Access can be limited or removed if an account is used to interfere with the app,
                  access unauthorized data, or publish inappropriate map content.
                </LegalBlock>
              </div>
            </article>

            <aside className="rounded-md border border-border bg-muted/30 p-6">
              <h2 className="text-lg font-semibold text-foreground">Ready to continue?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create your organization workspace or return to the public venue directory.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link className={cn(buttonVariants({ size: "lg" }), "h-10")} href={PUBLIC_ROUTES.SIGNUP}>
                  Register
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}
                  href={PUBLIC_ROUTES.HOME}
                >
                  Back to discover
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  );
}

function LegalBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-normal text-card-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{children}</p>
    </section>
  );
}
