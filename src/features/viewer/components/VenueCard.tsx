import { ChevronRight, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloorPlanPreview } from "@/features/viewer/components/FloorPlanPreview";
import type { LandingVenue } from "@/features/viewer/types";

type VenueCardProps = {
  venue: LandingVenue;
  onSelect: (venue: LandingVenue) => void;
};

export function VenueCard({ venue, onSelect }: VenueCardProps) {
  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm transition sm:hover:border-primary/35 sm:hover:shadow-md">
      <Button
        aria-label={`Choose a floor at ${venue.name}`}
        className="group grid h-auto min-h-28 w-full shrink grid-cols-[7.25rem_minmax(0,1fr)] rounded-none border-0 p-0 text-left whitespace-normal text-card-foreground hover:bg-card focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:block sm:min-h-0"
        type="button"
        variant="ghost"
        onClick={() => onSelect(venue)}
      >
        <span className="relative block min-h-28 overflow-hidden border-r border-border sm:h-32 sm:min-h-0 sm:border-b sm:border-r-0">
          <FloorPlanPreview
            floorCount={venue.floors.length}
            imageUrl={venue.logoUrl ?? venue.backgroundImageUrl}
            name={venue.name}
          />
        </span>

        <span className="flex min-w-0 items-center justify-between gap-3 p-3">
          <span className="min-w-0">
            <span className="line-clamp-1 text-sm font-semibold leading-5 text-card-foreground sm:text-base">
              {venue.name}
            </span>
            {venue.address ? (
              <span className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{venue.address}</span>
              </span>
            ) : null}
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <ChevronRight
              className="size-4 transition-transform sm:group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </span>
      </Button>
    </article>
  );
}
