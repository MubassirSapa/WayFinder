import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { OrganizationBuildingVisual } from "@/features/organization/components/OrganizationBuildingVisual";
import { cn } from "@/lib/utils";

export function OrganizationHero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-10 pt-14 text-center sm:px-6 sm:pb-0 sm:pt-0">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:mt-16 sm:text-5xl lg:mt-20 lg:text-6xl xl:mt-24">
          Make every building easier to navigate.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Create, maintain, and share clear indoor maps that help visitors reach the right
          destination.
        </p>

        <OrganizationBuildingVisual />

        <div className="mt-2 flex w-full max-w-sm flex-col justify-center gap-3 sm:order-1 sm:mt-8 sm:max-w-none sm:flex-row">
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
        <p className="mt-4 text-sm text-muted-foreground sm:order-2">
          Currently free for organizations.
        </p>
      </div>
    </section>
  );
}
