import Link from "next/link";
import { ArrowRight, Building2, ChevronDown, Layers3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FloorPlanPreview } from "@/features/public-landing/components/FloorPlanPreview";
import { pluralize } from "@/features/public-landing/lib/format";
import type { LandingFloor, LandingVenue } from "@/features/public-landing/types";
import { cn } from "@/lib/utils";

type VenueCardProps = {
  venue: LandingVenue;
  isOpen: boolean;
  isWide?: boolean;
  onToggle: () => void;
};

export function VenueCard({ venue, isOpen, isWide = false, onToggle }: VenueCardProps) {
  return (
    <article className={cn("space-y-3", isWide && "sm:col-span-2")}>
      <button
        aria-expanded={isOpen}
        className={cn(
          "group relative flex w-full overflow-hidden rounded-[18px] border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isWide ? "min-h-[158px]" : "min-h-[172px]",
        )}
        type="button"
        onClick={onToggle}
      >
        <FloorPlanPreview imageUrl={venue.backgroundImageUrl} name={venue.name} compact={!isWide} />
        <span className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <span className="absolute inset-0 bg-primary/5" />

        <span className="relative flex min-h-full w-full flex-col justify-between p-5 sm:p-6">
          <span className="flex items-start justify-between gap-4">
            <span className="flex size-[42px] items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <Building2 className="size-5" aria-hidden />
            </span>
            {venue.floorCount > 1 ? (
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                {pluralize(venue.floorCount, "floor")}
              </Badge>
            ) : null}
          </span>

          <span className="flex items-end justify-between gap-5">
            <span className="min-w-0">
              <span className="block truncate text-2xl font-semibold tracking-normal text-card-foreground">
                {venue.name}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {pluralize(venue.floorCount, "floor")} -{" "}
                {venue.accessibleCount > 0 ? "Step-free access" : "Published map"}
              </span>
            </span>
            <span className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition group-hover:scale-105">
              {isOpen ? (
                <ChevronDown className="size-5" aria-hidden />
              ) : (
                <ArrowRight className="size-5" aria-hidden />
              )}
            </span>
          </span>
        </span>
      </button>

      {isOpen ? <VenueFloorList floors={venue.floors} venueName={venue.name} /> : null}
    </article>
  );
}

function VenueFloorList({ floors, venueName }: { floors: LandingFloor[]; venueName: string }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Choose floor</p>
        <p className="mt-1 text-sm text-muted-foreground">{venueName}</p>
      </div>
      <div className="divide-y divide-border">
        {floors.map((floor) => (
          <div className="flex items-center justify-between gap-3 px-4 py-3" key={floor.id}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Layers3 className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-card-foreground">
                  {floor.name}
                </span>
                <span className="block text-xs text-muted-foreground">Level {floor.level}</span>
              </span>
            </div>
            <Link className={cn(buttonVariants({ size: "sm" }), "shrink-0")} href={floor.href}>
              Open map
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
