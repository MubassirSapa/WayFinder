import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";

export function OrganizationPromotion() {
  return (
    <section
      className="border-y border-primary/20 bg-primary/10 text-foreground"
      aria-labelledby="organization-promotion-heading"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-9 sm:px-6 sm:py-10 md:grid-cols-[minmax(0,1fr)_14rem] md:items-center md:gap-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">Manage a venue?</p>
          <h2
            className="mt-2 text-2xl font-semibold text-secondary-foreground sm:text-3xl"
            id="organization-promotion-heading"
          >
            Help visitors find the right floor.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Publish your indoor maps on Wayfinder and keep every destination easy to find.
          </p>
        </div>

        <div className="w-full md:justify-self-end">
          <Button
            className="h-11 w-full px-6 text-sm"
            nativeButton={false}
            render={<Link href={PUBLIC_ROUTES.ORGANIZATION} />}
          >
            Join now
          </Button>
        </div>
      </div>
    </section>
  );
}
