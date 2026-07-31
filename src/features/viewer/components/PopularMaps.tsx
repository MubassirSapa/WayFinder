import { FloorPlanPreview } from "@/features/viewer/components/FloorPlanPreview";
import type { LandingVenue } from "@/features/viewer/types";

type PopularMapsProps = {
  venues: LandingVenue[];
  onSelect: (venue: LandingVenue) => void;
};

export function PopularMaps({ venues, onSelect }: PopularMapsProps) {
  if (venues.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="popular-maps-heading">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl" id="popular-maps-heading">
          Popular maps
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Quick access to available venues.</p>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 py-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-4 sm:w-full sm:gap-6">
          {venues.map((venue) => (
            <li className="w-20 shrink-0 sm:w-24" key={venue.id}>
              <button
                aria-label={
                  venue.floors.length > 1
                    ? `Popular map: choose a floor at ${venue.name}`
                    : `Popular map: open ${venue.name}`
                }
                className="group flex w-full flex-col items-center gap-2 text-center focus-visible:outline-none"
                type="button"
                onClick={() => onSelect(venue)}
              >
                <span className="relative flex size-16 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-primary shadow-sm transition group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background sm:size-20 sm:group-hover:-translate-y-0.5 sm:group-hover:border-primary/50 sm:group-hover:shadow-md">
                  <FloorPlanPreview
                    compact
                    floorCount={venue.floors.length}
                    imageUrl={venue.backgroundImageUrl}
                    name={venue.name}
                  />
                </span>
                <span className="line-clamp-2 text-xs font-medium leading-4 text-foreground sm:text-sm">
                  {venue.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
