import Link from "next/link";
import { ArrowRight, Layers3, ShieldCheck } from "lucide-react";

import { formatObjectType } from "@/features/public-landing/lib/format";
import type { LandingDestination } from "@/features/public-landing/types";
import { cn } from "@/lib/utils";

type RecentPlacesProps = {
  destinations: LandingDestination[];
};

export function RecentPlaces({ destinations }: RecentPlacesProps) {
  if (destinations.length === 0) {
    return (
      <div className="rounded-[18px] border border-border bg-card p-6 shadow-sm">
        <p className="text-base font-semibold text-card-foreground">No recent places</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Searchable rooms, aisles, and points of interest will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-card shadow-sm">
      {destinations.map((destination) => (
        <RecentPlaceRow destination={destination} key={destination.id} />
      ))}
    </div>
  );
}

function RecentPlaceRow({ destination }: { destination: LandingDestination }) {
  const content = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {destination.isAccessible ? (
          <ShieldCheck className="size-4" aria-hidden />
        ) : (
          <Layers3 className="size-4" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-card-foreground">
          {destination.name}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {destination.venueName} - {destination.floorName} - {formatObjectType(destination.type)}
        </span>
      </span>
      {destination.href ? (
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
    </>
  );

  const className = cn(
    "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition last:border-b-0",
    destination.href && "hover:bg-muted/50",
  );

  if (!destination.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link className={className} href={destination.href}>
      {content}
    </Link>
  );
}
