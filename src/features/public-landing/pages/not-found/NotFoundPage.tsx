import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";
import { NotFoundActions } from "./NotFoundActions";

export function NotFoundPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-not-found-background text-not-found-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_78%_18%,#0c1715_0%,#070b0a_55%,#040706_100%)]" />
      <div className="absolute inset-0 animate-[wf-grid_16s_linear_infinite] bg-[linear-gradient(#0fae8f10_1px,transparent_1px),linear-gradient(90deg,#0fae8f10_1px,transparent_1px)] bg-size-[60px_60px] mask-[radial-gradient(110%_110%_at_75%_35%,#000_30%,transparent_80%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,transparent_40%,#040706_100%)]" />

      <header className="relative z-10 flex items-center justify-between px-5 py-6 sm:px-10 lg:px-14 lg:py-9">
        <WayfinderBrand href="/" textClassName="text-not-found-strong" />
        <div className="hidden font-mono text-xs uppercase tracking-[0.18em] text-not-found-subtle sm:block">
          Status - <span className="text-not-found-danger">No fix</span>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-12 px-5 pb-12 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:pb-0 lg:pt-0">
        <section className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-[wf-flicker_4s_infinite]" />
            Error 404
          </div>

          <h1 className="mt-7 text-5xl font-semibold leading-none tracking-[-0.03em] text-not-found-strong sm:text-6xl lg:text-[68px]">
            You&apos;ve wandered
            <br />
            off the map.
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-not-found-muted sm:text-[17px]">
            That Wayfinder page is not on any of our routes. It may have moved, or the trail has
            gone cold.
          </p>

          <div className="mt-7 flex flex-col items-center gap-2 text-center font-mono text-xs text-not-found-subtle sm:flex-row sm:justify-center sm:gap-6 sm:text-[13px] lg:justify-start lg:text-left">
            <span>
              LAT <span className="text-not-found-foreground">-- - -- - --</span>
            </span>
            <span>
              LON <span className="text-not-found-foreground">-- - -- - --</span>
            </span>
          </div>

          <div className="hidden lg:block">
            <NotFoundActions />
          </div>
        </section>

        <section className="flex items-center justify-center lg:h-full" aria-hidden>
          <RadarGraphic />
        </section>

        <div className="lg:hidden">
          <NotFoundActions className="mt-0" />
        </div>
      </div>
    </main>
  );
}

function RadarGraphic() {
  return (
    <div className="relative size-70 sm:size-90 lg:size-110">
      <div className="absolute inset-0 rounded-full border border-not-found-ring" />
      <div className="absolute inset-[13%] rounded-full border border-not-found-ring" />
      <div className="absolute inset-[26%] rounded-full border border-not-found-ring-strong/80" />
      <div className="absolute inset-[39%] rounded-full border border-not-found-ring-strong" />

      <div className="absolute inset-y-0 left-1/2 w-px bg-not-found-crosshair" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-not-found-crosshair" />

      <div className="absolute inset-0 animate-[wf-sweep_5s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,#10b89033_350deg,#10b89055_360deg)] mask-[radial-gradient(circle,#000_60%,transparent_71%)]" />

      <div className="absolute left-1/2 top-1/2 size-0 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute -top-19.5 -left-0.5 h-19.5 w-1 origin-bottom animate-[wf-needle_6s_ease-in-out_infinite] rounded-full bg-linear-to-b from-primary to-transparent" />
        <div className="absolute -left-1.75 -top-1.75 size-3.5 rounded-full border-2 border-primary bg-not-found-marker-background shadow-[0_0_16px_color-mix(in_oklch,var(--primary),transparent_45%)]" />
      </div>

      <div className="absolute left-[71%] top-[29%] animate-[wf-drift_7s_ease-in-out_infinite]">
        <div className="absolute -left-1 -top-1 size-3 rounded-full bg-not-found-danger animate-[wf-pulse_2.6s_ease-out_infinite]" />
        <div className="relative z-10 size-1.5 rounded-full bg-not-found-danger" />
        <div className="absolute left-4 -top-2.25 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-not-found-danger">
          Page - lost
        </div>
      </div>

      <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-mono text-xs text-not-found-subtle">
        N
      </span>
      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 font-mono text-xs text-not-found-subtle">
        S
      </span>
      <span className="absolute -left-6 top-1/2 -translate-y-1/2 font-mono text-xs text-not-found-subtle">
        W
      </span>
      <span className="absolute -right-6 top-1/2 -translate-y-1/2 font-mono text-xs text-not-found-subtle">
        E
      </span>
    </div>
  );
}
