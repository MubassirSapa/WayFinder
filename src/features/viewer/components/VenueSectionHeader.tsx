import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/constants/routes";

type VenueSectionHeaderProps = {
  description: string;
  href?: string;
  headingId: string;
  title: string;
};

export function VenueSectionHeader({
  description,
  href = PUBLIC_ROUTES.BUILDINGS,
  headingId,
  title,
}: VenueSectionHeaderProps) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-semibold text-foreground" id={headingId}>
        {title}
      </h2>
      <div className="mt-1 flex items-center justify-between gap-4">
        <p className="min-w-0 text-sm leading-6 text-muted-foreground">{description}</p>
        <Button
          className="h-8 min-w-20 px-3 text-xs sm:min-w-24 sm:text-sm"
          nativeButton={false}
          render={<Link href={href} />}
          variant="outline"
        >
          View all
        </Button>
      </div>
    </div>
  );
}
