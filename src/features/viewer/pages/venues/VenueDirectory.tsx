"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { EmptyDirectoryCard } from "@/features/viewer/components/EmptyDirectoryCard";
import { FloorSelectorDialog } from "@/features/viewer/components/FloorSelectorDialog";
import { VenueCard } from "@/features/viewer/components/VenueCard";
import { filterVenues } from "@/features/viewer/lib/filterVenues";
import { sortVenuesByNewest } from "@/features/viewer/lib/getRecentlyAddedVenues";
import type { PublicLandingData } from "@/features/viewer/types";

export type VenueDirectoryView = "all" | "recent";

type VenueDirectoryProps = {
  data: PublicLandingData;
  view?: VenueDirectoryView;
};

const VIEW_TITLES: Record<VenueDirectoryView, string> = {
  all: "All venues",
  recent: "Recently added venues",
};

export function VenueDirectory({ data, view = "all" }: VenueDirectoryProps) {
  const [query, setQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<PublicLandingData["venues"][number] | null>(
    null,
  );
  const venues = useMemo(() => {
    const filteredVenues = filterVenues(data.venues, query);

    return view === "recent" ? sortVenuesByNewest(filteredVenues) : filteredVenues;
  }, [data.venues, query, view]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Venue directory</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          Search by building name, then choose the floor you need.
        </p>
      </header>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-lg border border-border bg-card px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="sr-only">Search venues</span>
          <Input
            aria-label="Search venues"
            className="h-10 min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
            placeholder="Search venues"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <nav
          aria-label="Venue directory views"
          className="flex h-12 w-full shrink-0 items-center rounded-lg border border-border bg-muted p-1 sm:w-auto"
        >
          <Button
            aria-current={view === "all" ? "page" : undefined}
            className="h-10 flex-1 px-4 text-sm sm:flex-none"
            nativeButton={false}
            render={<Link href={PUBLIC_ROUTES.VENUES} />}
            variant={view === "all" ? "default" : "ghost"}
          >
            All venues
          </Button>
          <Button
            aria-current={view === "recent" ? "page" : undefined}
            className="h-10 flex-1 px-4 text-sm sm:flex-none"
            nativeButton={false}
            render={<Link href={PUBLIC_ROUTES.VENUES_RECENT} />}
            variant={view === "recent" ? "default" : "ghost"}
          >
            Recently added
          </Button>
        </nav>
      </div>

      <section aria-labelledby="venue-directory-heading" className="mt-8">
        <h2 className="sr-only" id="venue-directory-heading">
          {VIEW_TITLES[view]}
        </h2>

        {data.venues.length === 0 ? (
          <EmptyDirectoryCard isAvailable={data.isAvailable} />
        ) : venues.length > 0 ? (
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} onSelect={setSelectedVenue} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="font-semibold text-card-foreground">No matching venues</p>
            <p className="mt-2 text-sm text-muted-foreground">Try another venue name.</p>
          </div>
        )}
      </section>

      <FloorSelectorDialog venue={selectedVenue} onClose={() => setSelectedVenue(null)} />
    </div>
  );
}
