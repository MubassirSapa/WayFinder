import { VenueCard } from "@/features/viewer/components/VenueCard";
import { VenueSectionHeader } from "@/features/viewer/components/VenueSectionHeader";
import { PUBLIC_ROUTES } from "@/constants/routes";
import type { LandingVenue } from "@/features/viewer/types";

type RecentlyAddedVenuesProps = {
  venues: LandingVenue[];
  onSelect: (venue: LandingVenue) => void;
};

export function RecentlyAddedVenues({ venues, onSelect }: RecentlyAddedVenuesProps) {
  if (venues.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="recently-added-heading">
      <VenueSectionHeader
        description="New buildings ready to explore."
        href={PUBLIC_ROUTES.BUILDINGS_RECENT}
        headingId="recently-added-heading"
        title="Recently added"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
