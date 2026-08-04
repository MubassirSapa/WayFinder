import { cn } from "@/lib/utils";

export function FloorMiniMap({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative h-[68px] w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/40",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--color-primary)_1px,transparent_1px),linear-gradient(90deg,var(--color-primary)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute inset-3 rounded-md border border-primary/40 bg-primary/5" />
      <div className="absolute left-5 top-5 h-3 w-5 rounded-sm bg-primary/20" />
      <div className="absolute left-[48px] top-[33px] w-9 border-t border-dashed border-primary/50" />
      <div className="absolute right-4 top-[29px] size-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
    </div>
  );
}
