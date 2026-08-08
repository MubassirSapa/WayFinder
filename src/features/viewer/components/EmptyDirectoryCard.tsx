import { Radar } from "lucide-react";

type EmptyDirectoryCardProps = {
  isAvailable: boolean;
};

export function EmptyDirectoryCard({ isAvailable }: EmptyDirectoryCardProps) {
  return (
    <div className="relative min-h-65 overflow-hidden rounded-lg border border-dashed border-border bg-card p-6 shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[44px_44px] opacity-20" />
      <div className="pointer-events-none absolute right-5 top-5 size-24 rounded-full border border-primary/15 opacity-60 sm:right-8 sm:top-8 sm:size-32 sm:opacity-100">
        <span className="absolute inset-4 rounded-full border border-primary/15" />
        <span className="absolute inset-8 rounded-full border border-primary/15" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-primary/10" />
        <span className="absolute inset-x-0 top-1/2 h-px bg-primary/10" />
        <span className="absolute inset-0 animate-[wf-sweep_7s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,var(--color-primary)_350deg,var(--color-primary)_360deg)] opacity-25 mask-[radial-gradient(circle,var(--mask-opaque)_48%,transparent_72%)]" />
        <span className="absolute left-[68%] top-[30%]">
          <span className="absolute -left-1 -top-1 size-3 rounded-full bg-destructive animate-[wf-pulse_3.2s_ease-out_infinite]" />
          <span className="relative z-10 block size-1.5 rounded-full bg-destructive" />
        </span>
      </div>
      <div className="relative z-10 max-w-2xl">
        <span className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <span className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
          <Radar className="relative size-7" aria-hidden />
        </span>
        <h2 className="mt-8 text-2xl font-semibold tracking-normal text-card-foreground sm:text-3xl">
          No public buildings yet
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isAvailable
            ? "Building maps will appear here when they are ready for visitors."
            : "We couldn't load buildings right now. Please try again in a moment."}
        </p>
      </div>
    </div>
  );
}
