import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function OrganizationCta() {
  return (
    <section className="border-y border-primary/20 bg-primary/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-12 text-center sm:px-6 lg:py-16 xl:flex-row xl:justify-between xl:text-left">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-foreground">
            Ready to publish your first map?
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            Create your organization workspace and turn floor plans into clear visitor journeys.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 xl:shrink-0">
          <Link
            className={cn(buttonVariants({ size: "lg" }), "min-h-11 px-5 text-sm")}
            href={PUBLIC_ROUTES.REGISTER_ORGANIZATION}
          >
            Get started
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              className="font-semibold text-primary drop-shadow-[0_0_6px_var(--organization-signin-glow)] transition-colors hover:text-foreground"
              href={PUBLIC_ROUTES.SIGNIN}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
