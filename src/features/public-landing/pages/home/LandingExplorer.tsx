"use client";

import { MapPinned, Mic, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyDirectoryCard } from "@/features/public-landing/components/EmptyDirectoryCard";
import { RecentPlaces } from "@/features/public-landing/components/RecentPlaces";
import { VenueCard } from "@/features/public-landing/components/VenueCard";
import { pluralize } from "@/features/public-landing/lib/format";
import type { PublicLandingData } from "@/features/public-landing/types";
import { cn } from "@/lib/utils";

type LandingExplorerProps = {
  data: PublicLandingData;
};

type FilterKey = "all" | "accessible" | "multi-floor" | "searchable";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All venues" },
  { key: "accessible", label: "Step-free" },
  { key: "multi-floor", label: "Multi-floor" },
  { key: "searchable", label: "Searchable" },
];

export function LandingExplorer({ data }: LandingExplorerProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openVenueId, setOpenVenueId] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const venues = useMemo(
    () =>
      data.venues.filter((venue) => {
        const floorText = venue.floors.map((floor) => floor.name).join(" ");
        const matchesQuery =
          !normalizedQuery ||
          [venue.name, venue.primaryFloorName, floorText]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesFilter =
          filter === "all" ||
          (filter === "accessible" && venue.accessibleCount > 0) ||
          (filter === "multi-floor" && venue.floorCount > 1) ||
          (filter === "searchable" && venue.searchableCount > 0);

        return matchesQuery && matchesFilter;
      }),
    [data.venues, filter, normalizedQuery],
  );

  const recentDestinations = useMemo(
    () =>
      data.recentDestinations.filter((destination) => {
        if (!normalizedQuery) return true;

        return [destination.name, destination.type, destination.venueName, destination.floorName]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [data.recentDestinations, normalizedQuery],
  );

  return (
    <>
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 pb-12 pt-14 text-center sm:pb-16 sm:pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <MapPinned className="size-3.5" aria-hidden />
          Indoor wayfinding
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
          Where to?
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Search published indoor maps for any venue, room, or point of interest.
        </p>

        <div className="mt-7 w-full max-w-3xl rounded-[15px] border border-border bg-card px-5 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
          <div className="flex h-[62px] items-center gap-3">
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <Input
              aria-label="Search venues, rooms, or categories"
              className="h-full border-0 bg-transparent px-0 text-sm text-foreground shadow-none outline-none ring-0 placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
              placeholder="Search buildings, rooms, or categories..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="h-6 w-px bg-border" aria-hidden />
            <Mic className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {filters.map((item) => (
            <button
              className={cn(
                "inline-flex h-8 items-center rounded-full border px-4 text-xs font-medium transition",
                filter === item.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section
        className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-16 lg:grid-cols-[minmax(0,1fr)_360px]"
        id="venues"
      >
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-foreground">
                Explore venues
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Live from published floors in the map system.
              </p>
            </div>
            <Badge className="hidden border-primary/20 bg-primary/10 text-primary sm:inline-flex">
              {pluralize(venues.length, "venue")}
            </Badge>
          </div>

          {data.venues.length === 0 ? (
            <EmptyDirectoryCard isAvailable={data.isAvailable} />
          ) : venues.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {venues.map((venue, index) => (
                <VenueCard
                  isOpen={openVenueId === venue.id}
                  isWide={index >= 2}
                  key={venue.id}
                  venue={venue}
                  onToggle={() => setOpenVenueId(openVenueId === venue.id ? null : venue.id)}
                />
              ))}
            </div>
          ) : (
            <NoMatchesCard />
          )}
        </div>

        <aside>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-foreground">Recent</h2>
              <p className="mt-1 text-sm text-muted-foreground">Searchable places updated last.</p>
            </div>
            <span className="text-xs font-medium text-primary">
              {pluralize(recentDestinations.length, "place")}
            </span>
          </div>

          {data.venues.length > 0 ? (
            <RecentPlaces destinations={recentDestinations} />
          ) : (
            <RecentSkeletonCard />
          )}
        </aside>
      </section>
    </>
  );
}

function NoMatchesCard() {
  return (
    <div className="rounded-[18px] border border-border bg-card p-6 shadow-sm">
      <p className="text-base font-semibold text-card-foreground">No matching venues</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Try a different search term or switch back to all venues.
      </p>
    </div>
  );
}

function RecentSkeletonCard() {
  return (
    <div className="space-y-3 rounded-[18px] border border-border bg-card p-5 shadow-sm">
      <p className="text-base font-semibold text-card-foreground">No recent places</p>
      <p className="text-sm leading-6 text-muted-foreground">
        Searchable rooms, aisles, and points of interest will appear here after floors are
        published.
      </p>
      <div className="space-y-3 pt-2" aria-hidden>
        <span className="block h-10 rounded-md bg-muted/70" />
        <span className="block h-10 rounded-md bg-muted/50" />
        <span className="block h-10 rounded-md bg-muted/30" />
      </div>
    </div>
  );
}
