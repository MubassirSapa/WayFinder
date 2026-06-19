import Link from "next/link";
import { ArrowRight, Radar } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyDirectoryCardProps = {
  isAvailable: boolean;
};

export function EmptyDirectoryCard({ isAvailable }: EmptyDirectoryCardProps) {
  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-[18px] border border-dashed border-border bg-card p-6 shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[length:44px_44px] opacity-20" />
      <div className="absolute right-8 top-8 hidden size-32 rounded-full border border-primary/15 sm:block">
        <span className="absolute inset-4 rounded-full border border-primary/15" />
        <span className="absolute inset-8 rounded-full border border-primary/15" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-primary/10" />
        <span className="absolute inset-x-0 top-1/2 h-px bg-primary/10" />
        <span className="absolute inset-0 animate-[wf-sweep_7s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,var(--color-primary)_350deg,var(--color-primary)_360deg)] opacity-25 mask-[radial-gradient(circle,#000_48%,transparent_72%)]" />
        <span className="absolute left-[68%] top-[30%]">
          <span className="absolute -left-1 -top-1 size-3 rounded-full bg-destructive animate-[wf-pulse_3.2s_ease-out_infinite]" />
          <span className="relative z-10 block size-1.5 rounded-full bg-destructive" />
        </span>
      </div>
      <div className="relative max-w-2xl">
        <span className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <span className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
          <Radar className="relative size-7" aria-hidden />
        </span>
        <h2 className="mt-8 text-2xl font-semibold tracking-normal text-card-foreground sm:text-3xl">
          No public buildings yet
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isAvailable
            ? "No public maps are available yet. Register your organization and publish the first floor to make the building searchable here."
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
