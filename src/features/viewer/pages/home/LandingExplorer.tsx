"use client";

import { Search } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyDirectoryCard } from "@/features/viewer/components/EmptyDirectoryCard";
import { FloorSelectorDialog } from "@/features/viewer/components/FloorSelectorDialog";
import { OrganizationPromotion } from "@/features/viewer/components/OrganizationPromotion";
import { PopularMaps } from "@/features/viewer/components/PopularMaps";
import { RecentlyAddedVenues } from "@/features/viewer/components/RecentlyAddedVenues";
import { VenueCard } from "@/features/viewer/components/VenueCard";
import { VenueSectionHeader } from "@/features/viewer/components/VenueSectionHeader";
import { ViewerHeroVisual } from "@/features/viewer/components/ViewerHeroVisual";
import { filterVenues } from "@/features/viewer/lib/filterVenues";
import { getPopularVenues } from "@/features/viewer/lib/getPopularVenues";
import { getRecentlyAddedVenues } from "@/features/viewer/lib/getRecentlyAddedVenues";
import type { LandingVenue, PublicLandingData } from "@/features/viewer/types";

type LandingExplorerProps = {
  data: PublicLandingData;
};

export function LandingExplorer({ data }: LandingExplorerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<LandingVenue | null>(null);

  const venues = useMemo(() => filterVenues(data.venues, query), [data.venues, query]);
  const popularVenues = useMemo(() => getPopularVenues(data.venues), [data.venues]);
  const recentlyAddedVenues = useMemo(() => getRecentlyAddedVenues(data.venues), [data.venues]);
  const visibleVenues = query.trim() ? venues : venues.slice(0, 4);

  function selectVenue(venue: LandingVenue) {
    setSelectedVenue(venue);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (venues.length === 1) {
      if (venues[0].floors.length === 1) {
        router.push(venues[0].href);
      } else {
        selectVenue(venues[0]);
      }
      return;
    }

    document.getElementById("venues")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className="overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-3 px-5 pb-5 pt-8 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-8">
          <div className="relative z-10 min-w-0 text-center lg:text-left">
            <h1 className="mx-auto max-w-72 text-pretty text-3xl font-semibold tracking-normal text-foreground sm:max-w-2xl sm:text-5xl lg:mx-0">
              Where do you want to go?
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-6 text-muted-foreground sm:max-w-xl sm:text-base lg:mx-0">
              Search for a venue, choose the right floor, and open its indoor map.
            </p>

            <form
              aria-label="Search venues"
              className="mx-auto mt-7 flex w-full min-w-0 max-w-2xl items-center gap-2 overflow-hidden rounded-lg border border-border bg-card p-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 lg:mx-0"
              role="search"
              onSubmit={submitSearch}
            >
              <Search className="ml-2 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <Input
                aria-label="Search by venue name"
                className="h-11 w-auto min-w-0 flex-1 border-0 bg-transparent px-1 text-base shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
                placeholder="Search venues"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button className="h-11 px-4 text-sm" type="submit">
                <Search className="size-4 sm:hidden" aria-hidden />
                <span className="hidden sm:inline">Search</span>
                <span className="sr-only sm:hidden">Search</span>
              </Button>
            </form>
          </div>

          <ViewerHeroVisual />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-6">
        <PopularMaps venues={popularVenues} onSelect={selectVenue} />
      </section>

      <section className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 pb-12 sm:px-6" id="venues">
        {data.venues.length > 0 ? (
          <VenueSectionHeader
            description="Select a venue, then choose a floor."
            headingId="browse-venues-heading"
            title="Browse venues"
          />
        ) : (
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-foreground" id="browse-venues-heading">
              Browse venues
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Select a venue, then choose a floor.
            </p>
          </div>
        )}

        {data.venues.length === 0 ? (
          <EmptyDirectoryCard isAvailable={data.isAvailable} />
        ) : venues.length > 0 ? (
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visibleVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onSelect={selectVenue}
              />
            ))}
          </div>
        ) : (
          <NoMatchesCard />
        )}
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-6">
        <RecentlyAddedVenues venues={recentlyAddedVenues} onSelect={selectVenue} />
      </div>

      <OrganizationPromotion />

      <FloorSelectorDialog venue={selectedVenue} onClose={() => setSelectedVenue(null)} />
    </>
  );
}

function NoMatchesCard() {
  return (
    <div className="rounded-md border border-border bg-card p-6">
      <p className="text-base font-semibold text-card-foreground">No matching venues</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Try another venue name.
      </p>
    </div>
  );
}
