import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Database, Lock, Mail, ShieldCheck, UserRound } from "lucide-react";

import { PublicSiteFooter } from "@/components/shared/public-site/PublicSiteFooter";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { PublicSiteHeader } from "@/features/public-landing/components/PublicSiteHeader";
import { cn } from "@/lib/utils";

const privacySections = [
  {
    title: "Information we collect",
    description:
      "Wayfinder stores the account, organization, building, floor, and map data needed to run the indoor mapping workspace.",
    icon: Database,
  },
  {
    title: "Account and email data",
    description:
      "We use your name, email address, password authentication, verification status, and password reset tokens to manage account access.",
    icon: UserRound,
  },
  {
    title: "Email communication",
    description:
      "Verification, welcome, and password recovery emails are sent through the configured email provider for account-related actions.",
    icon: Mail,
  },
  {
    title: "Private workspace access",
    description:
      "Organization dashboards, editor routes, and floor management tools are intended for authorized users only.",
    icon: Lock,
  },
];

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND.NAME}`,
  description: `How ${BRAND.NAME} handles account, organization, and indoor map data.`,
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[60px_60px] opacity-10 mask-[radial-gradient(80%_80%_at_50%_10%,var(--mask-opaque),transparent_72%)]" />
          <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden />
              Privacy
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              This page explains, in plain language, what {BRAND.NAME} stores and how that
              information is used to support account access and indoor map management.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: June 19, 2026</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-4 md:grid-cols-2">
            {privacySections.map((section) => (
              <article className="rounded-md border border-border bg-card p-5" key={section.title}>
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <section.icon className="size-5" aria-hidden />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-card-foreground">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {section.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-md border border-border bg-card p-6 sm:p-8">
              <div className="space-y-8">
                <LegalBlock title="How we use information">
                  We use stored information to create accounts, verify emails, keep users signed in,
                  recover passwords, manage organizations, and display available indoor maps to the
                  public experience.
                </LegalBlock>
                <LegalBlock title="Map and organization data">
                  Organization owners are responsible for the building, floor, room, route, and point
                  of interest information they add. Public map data may be visible to visitors when
                  a floor is made available.
                </LegalBlock>
                <LegalBlock title="Security">
                  Authentication is handled through Payload sessions and private routes are protected
                  by access checks. Keep your login details private and use a strong password.
                </LegalBlock>
                <LegalBlock title="Data updates">
                  If organization or map information is incorrect, update it from the dashboard or
                  contact the project team responsible for the workspace.
                </LegalBlock>
              </div>
            </article>

            <aside className="rounded-md border border-border bg-muted/30 p-6">
              <h2 className="text-lg font-semibold text-foreground">Need to manage your data?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in to update your workspace, or create an account if your organization is not
                set up yet.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link className={cn(buttonVariants({ size: "lg" }), "h-10")} href={PUBLIC_ROUTES.SIGNIN}>
                  Log in
                </Link>
                <Link
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}
                  href={PUBLIC_ROUTES.SIGNUP}
                >
                  Register
                  <ArrowRight className="size-4" aria-hidden />
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
