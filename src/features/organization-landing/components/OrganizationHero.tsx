import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function OrganizationHero() {
  return (
    <section>
      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-6 pt-14 text-center sm:px-6 sm:py-20 lg:py-24">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
          Make every building easier to navigate.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Create, maintain, and share clear indoor maps that help visitors reach the right
          destination.
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
          <Link
            className={cn(buttonVariants({ size: "lg" }), "min-h-11 px-5 text-sm")}
            href={PUBLIC_ROUTES.REGISTER_ORGANIZATION}
          >
            Join now
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-h-11 px-5 text-sm",
            )}
            href={PUBLIC_ROUTES.SIGNIN}
          >
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Currently free for organizations.</p>
      </div>
    </section>
  );
}
