"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Layers3,
  Mic,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { FloorPlanPreview } from "./FloorPlanPreview";
import type { LandingDestination, LandingVenue, PublicLandingData } from "../types";
import { formatObjectType, pluralize } from "../lib/format";

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

  const normalizedQuery = query.trim().toLowerCase();

  const venues = useMemo(
    () =>
      data.venues.filter((venue) => {
        const matchesQuery =
          !normalizedQuery ||
          [venue.name, venue.primaryFloorName]
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
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
          Where to?
        </h1>
        <div className="mt-7 w-full rounded-xl border border-slate-300 bg-white px-4 shadow-sm transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-600/10">
          <div className="flex h-12 items-center gap-3">
            <Search className="size-4 shrink-0 text-slate-500" aria-hidden />
            <Input
              aria-label="Search venues, rooms, or categories"
              className="h-full border-0 bg-transparent px-0 text-sm text-slate-950 shadow-none outline-none ring-0 placeholder:text-slate-500 focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
              placeholder="Search buildings, rooms, or categories..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Mic className="size-4 shrink-0 text-slate-500" aria-hidden />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {filters.map((item) => (
            <button
              className={cn(
                "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition",
                filter === item.key
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950",
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

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-16 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                Explore venues
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Live from published floors in the map system.
              </p>
            </div>
            <Badge className="hidden border-teal-200 bg-teal-50 text-teal-800 sm:inline-flex">
              {pluralize(data.stats.venueCount, "venue")}
            </Badge>
          </div>

          {venues.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {venues.map((venue, index) => (
                <VenueCard compact={index < 2} key={venue.id} venue={venue} />
              ))}
            </div>
          ) : (
              <EmptyState
                description={
                  data.isAvailable
                  ? "No public maps are available yet. Register your venue to start building indoor maps."
                  : "The public directory could not reach Payload data right now."
                }
                title="No public venues yet"
                ctaLabel="Register your venue"
                ctaHref="/signup"
              />
          )}
        </div>

        <aside className="space-y-6">
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Recent</h2>
                <p className="mt-1 text-sm text-slate-600">Searchable places updated last.</p>
              </div>
              <span className="text-xs font-medium text-teal-700">
                {pluralize(data.stats.destinationCount, "place")}
              </span>
            </div>

            {recentDestinations.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                {recentDestinations.map((destination) => (
                  <RecentDestinationRow destination={destination} key={destination.id} />
                ))}
              </div>
            ) : (
              <EmptyState
                description="Searchable rooms, aisles, and points of interest will appear here."
                title="No recent places"
                small
              />
            )}
          </div>
        </aside>
      </section>
    </>
  );
}

function VenueCard({ venue, compact }: { venue: LandingVenue; compact: boolean }) {
  return (
    <article
      className={cn(
        "relative min-h-44 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm",
        !compact && "sm:col-span-2",
      )}
    >
      <FloorPlanPreview imageUrl={venue.backgroundImageUrl} name={venue.name} compact={compact} />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/20" />
      <div className="relative flex min-h-44 flex-col justify-end p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-teal-700 text-white">
            <Building2 className="size-4" aria-hidden />
          </span>
          {venue.accessibleCount > 0 ? (
            <Badge className="border-teal-200 bg-teal-50 text-teal-800">Step-free data</Badge>
          ) : null}
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-normal text-slate-950">{venue.name}</h3>
            <p className="mt-1 text-xs text-slate-700">
              {pluralize(venue.floorCount, "floor")} •{" "}
              {pluralize(venue.searchableCount, "searchable place")}
            </p>
            <p className="mt-1 text-xs text-slate-500">Latest floor: {venue.primaryFloorName}</p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white">
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}

function RecentDestinationRow({ destination }: { destination: LandingDestination }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
        {destination.isAccessible ? (
          <ShieldCheck className="size-4" aria-hidden />
        ) : (
          <Layers3 className="size-4" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-950">{destination.name}</span>
        <span className="block truncate text-xs text-slate-600">
          {destination.venueName} • {destination.floorName} • {formatObjectType(destination.type)}
        </span>
      </span>
    </div>
  );
}

function EmptyState({
  title,
  description,
  small = false,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  small?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-700",
        small ? "min-h-32" : "min-h-44",
      )}
    >
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      {ctaHref && ctaLabel ? (
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-5 border-slate-300")}
          href={ctaHref}
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
