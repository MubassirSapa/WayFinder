"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Layers3,
  MapPinned,
  Mic,
  Route,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloorPlanPreview } from "@/features/public-landing/components/FloorPlanPreview";
import { formatObjectType, pluralize } from "@/features/public-landing/lib/format";
import type {
  LandingDestination,
  LandingVenue,
  PublicLandingData,
} from "@/features/public-landing/types";
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

const workflowItems = [
  {
    title: "Register a venue",
    description: "Create an organization workspace for the building or facility you manage.",
    icon: Building2,
  },
  {
    title: "Publish floors",
    description: "Add buildings, floors, rooms, entrances, and searchable points of interest.",
    icon: Layers3,
  },
  {
    title: "Guide visitors",
    description: "Let users search public destinations and understand where to go before arriving.",
    icon: Route,
  },
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
          [venue.name, venue.primaryFloorName].join(" ").toLowerCase().includes(normalizedQuery);

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
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-5 pb-10 pt-12 text-center sm:pb-14 sm:pt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <MapPinned className="size-3.5" aria-hidden />
          Public indoor wayfinding
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
          Find your way inside buildings.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Search published indoor maps for rooms, departments, services, and public destinations.
          Venue owners can register their organization and start publishing floors.
        </p>
        <div className="mt-7 w-full rounded-md border border-border bg-card px-4 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
          <div className="flex h-12 items-center gap-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <Input
              aria-label="Search venues, rooms, or categories"
              className="h-full border-0 bg-transparent px-0 text-sm text-foreground shadow-none outline-none ring-0 placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
              placeholder="Search buildings, rooms, or categories..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Mic className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {filters.map((item) => (
            <button
              className={cn(
                "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition",
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
        <div className="mt-7 grid w-full max-w-2xl grid-cols-3 overflow-hidden rounded-md border border-border bg-card text-left shadow-sm">
          <StatItem label="Venues" value={data.stats.venueCount} />
          <StatItem label="Floors" value={data.stats.floorCount} />
          <StatItem label="Places" value={data.stats.destinationCount} />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-16 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-foreground">
                Published venues
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Live from floors marked as published in the map system.
              </p>
            </div>
            <Badge className="hidden border-primary/20 bg-primary/10 text-primary sm:inline-flex">
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
                  ? "No public maps are available yet. Register your organization and publish your first floor to make it searchable here."
                  : "The public directory could not reach Payload data right now."
              }
              title="No venues published yet"
              ctaLabel="Register organization"
              ctaHref="/signup"
            />
          )}
        </div>

        <aside className="space-y-6">
          {data.stats.venueCount > 0 ? (
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-normal text-foreground">Recent</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Searchable places updated last.
                  </p>
                </div>
                <span className="text-xs font-medium text-primary">
                  {pluralize(data.stats.destinationCount, "place")}
                </span>
              </div>

              {recentDestinations.length > 0 ? (
                <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
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
          ) : (
            <OwnerPanel />
          )}
        </aside>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">
              How Wayfinder works
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The public homepage stays simple for visitors, while owners manage the map data behind
              it from their workspace.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {workflowItems.map((item) => (
              <article
                className="rounded-md border border-border bg-card p-5 shadow-sm"
                key={item.title}
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-base font-semibold text-card-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-border px-4 py-3 last:border-r-0">
      <p className="text-xl font-semibold text-card-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function OwnerPanel() {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Building2 className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">For venue owners</h2>
          <p className="text-sm text-muted-foreground">Start the directory with your own map.</p>
        </div>
      </div>
      <div className="mt-5 space-y-3 text-sm text-muted-foreground">
        <p>1. Register your organization.</p>
        <p>2. Add buildings and floors.</p>
        <p>3. Publish searchable places for visitors.</p>
      </div>
      <Link className={cn(buttonVariants({ size: "lg" }), "mt-5 h-10 w-full")} href="/signup">
        Register organization
      </Link>
    </div>
  );
}

function VenueCard({ venue, compact }: { venue: LandingVenue; compact: boolean }) {
  return (
    <article
      className={cn(
        "relative min-h-44 overflow-hidden rounded-md border border-border bg-card shadow-sm",
        !compact && "sm:col-span-2",
      )}
    >
      <FloorPlanPreview imageUrl={venue.backgroundImageUrl} name={venue.name} compact={compact} />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/20" />
      <div className="relative flex min-h-44 flex-col justify-end p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="size-4" aria-hidden />
          </span>
          {venue.accessibleCount > 0 ? (
            <Badge className="border-primary/20 bg-primary/10 text-primary">Step-free data</Badge>
          ) : null}
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-normal text-card-foreground">{venue.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {pluralize(venue.floorCount, "floor")} -{" "}
              {pluralize(venue.searchableCount, "searchable place")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">Latest floor: {venue.primaryFloorName}</p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}

function RecentDestinationRow({ destination }: { destination: LandingDestination }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {destination.isAccessible ? (
          <ShieldCheck className="size-4" aria-hidden />
        ) : (
          <Layers3 className="size-4" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-card-foreground">{destination.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {destination.venueName} - {destination.floorName} - {formatObjectType(destination.type)}
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
        "rounded-md border border-dashed border-border bg-card p-6 text-muted-foreground shadow-sm",
        small ? "min-h-32" : "min-h-44",
      )}
    >
      <p className="text-sm font-semibold text-card-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      {ctaHref && ctaLabel ? (
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-5")}
          href={ctaHref}
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
