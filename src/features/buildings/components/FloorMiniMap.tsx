import { cn } from "@/lib/utils";

export function FloorMiniMap({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--color-primary)_1px,transparent_1px),linear-gradient(90deg,var(--color-primary)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute inset-2 rounded-md border border-primary/40 bg-primary/5" />
      <div className="absolute left-4 top-4 h-2.5 w-4 rounded-sm bg-primary/20" />
      <div className="absolute left-9 top-7 w-6 border-t border-dashed border-primary/50" />
      <div className="absolute right-3 top-6 size-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
    </div>
  );
}
