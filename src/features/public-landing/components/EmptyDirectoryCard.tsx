import Link from "next/link";
import { ArrowRight, Radar } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyDirectoryCardProps = {
  isAvailable: boolean;
};

export function EmptyDirectoryCard({ isAvailable }: EmptyDirectoryCardProps) {
  return (
    <div className="relative min-h-[236px] overflow-hidden rounded-[18px] border border-dashed border-border bg-card p-6 shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[length:44px_44px] opacity-20" />
      <div className="relative">
        <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Radar className="size-6" aria-hidden />
        </span>
        <h2 className="mt-8 text-2xl font-semibold tracking-normal text-card-foreground">
          No public venues yet
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {isAvailable
            ? "No public maps are available yet. Register your organization and publish the first floor to make it searchable here."
            : "The public directory could not reach Payload data right now. Try again once the app is connected."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className={cn(buttonVariants({ size: "lg" }), "h-9")} href="/signup">
            Register your venue
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-9")} href="/about">
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
}
