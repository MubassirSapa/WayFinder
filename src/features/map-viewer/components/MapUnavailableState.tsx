import Link from "next/link";

import { Button } from "@/components/ui/button";

interface MapUnavailableStateProps {
  floorId?: string;
}

export function MapUnavailableState({
  floorId,
}: MapUnavailableStateProps) {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full rounded-4xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Public Map Viewer
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Sorry, this map is not available yet.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {floorId
              ? `Floor ${floorId} may still be in draft or has not been published for public viewing.`
              : "There are no published maps to view right now. The map may still be in draft."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              size="lg"
            >
              Back to home
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/admin" />}
              size="lg"
              variant="outline"
            >
              Open admin
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
