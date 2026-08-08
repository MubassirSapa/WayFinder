import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { PUBLIC_ROUTES } from "@/constants/routes";

export function OrganizationVisitorHandoff() {
  return (
    <aside className="border-b border-border px-4 py-2 sm:px-6" aria-label="Visitor map access">
      <Link
        className="group mx-auto flex min-h-11 w-full max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-md border border-primary/10 bg-primary/10 px-4 py-2 text-center text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:px-6 sm:text-sm"
        href={PUBLIC_ROUTES.BUILDINGS}
      >
        <MapPin className="size-4 shrink-0 text-foreground" aria-hidden />
        <span>Visiting a building?</span>{" "}
        <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
          Find its public map
          <ArrowRight
            className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </Link>
    </aside>
  );
}
