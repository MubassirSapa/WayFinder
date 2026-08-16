import Link from "next/link";
import { ArrowRight, Building2, HelpCircle, Mail, MessageSquare } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const reasons = [
  {
    icon: Building2,
    title: "Setting up your building",
    description: "Questions about mapping your first floor, connecting floors together, or how the editor works.",
  },
  {
    icon: HelpCircle,
    title: "Something isn't working",
    description: "Run into a bug, an unclear route, or a publishing issue? Tell us what happened and we'll look into it.",
  },
  {
    icon: MessageSquare,
    title: "Feedback or a feature request",
    description: "Wayfinder is still actively built. If something is missing or could work better, we want to hear it.",
  },
] as const;

export function OrganizationContactContent() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 pb-12 pt-14 text-center sm:px-6 sm:pt-20 lg:pt-24">
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Let&apos;s talk about your building.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Questions about bringing Wayfinder to your organization, or already mapping a building
            and need a hand? Email us directly. We read every message ourselves.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            What we can help with
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:gap-4">
            {reasons.map((reason) => {
              const Icon = reason.icon;

              return (
                <article
                  className="flex min-h-48 flex-col items-center justify-center rounded-md border border-border bg-card px-5 py-7 text-center text-card-foreground"
                  key={reason.title}
                >
                  <Icon className="size-8 text-primary" strokeWidth={1.7} aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-foreground">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {reason.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-primary/20 bg-primary/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-12 text-center sm:px-6 lg:py-16 xl:flex-row xl:justify-between xl:text-left">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-foreground">Reach us any time</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              No forms, no ticket queue: just a direct line to the team.
            </p>
          </div>

          <a
            className={cn(buttonVariants({ size: "lg" }), "min-h-11 px-5 text-sm")}
            href={`mailto:${BRAND.SUPPORT_EMAIL}`}
          >
            <Mail className="size-4" aria-hidden />
            {BRAND.SUPPORT_EMAIL}
          </a>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-6 lg:py-16">
          <p className="text-sm text-muted-foreground sm:text-base">
            Already know Wayfinder is right for you?{" "}
            <Link
              className="inline-flex items-center gap-1 font-semibold text-primary drop-shadow-[0_0_6px_var(--organization-signin-glow)] transition-colors hover:text-foreground"
              href={PUBLIC_ROUTES.REGISTER_ORGANIZATION}
            >
              Create your organization
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
