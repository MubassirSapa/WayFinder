import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type OrganizationCtaProps = {
  variant?: "compact" | "default";
};

export function OrganizationCta({ variant = "default" }: OrganizationCtaProps) {
  const compact = variant === "compact";
  const content = (
    <>
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Start building with Wayfinder.</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          Create your organization workspace. Wayfinder is currently free to use.
        </p>
      </div>
      <div
        className={cn(
          "flex flex-col gap-3",
          compact
            ? "w-full max-w-xs items-center text-center"
            : "sm:flex-row sm:items-center md:shrink-0",
        )}
      >
        <Link
          className={cn(buttonVariants({ size: "lg" }), "min-h-11 px-5 text-sm")}
          href={PUBLIC_ROUTES.REGISTER_ORGANIZATION}
        >
          Join now
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          href={PUBLIC_ROUTES.SIGNIN}
        >
          Already have an account? Sign in
        </Link>
      </div>
    </>
  );

  if (compact) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-7 text-center xl:mx-0 xl:items-start xl:text-left">
        {content}
      </div>
    );
  }

  return (
    <section className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:py-16">
        {content}
      </div>
    </section>
  );
}
