import type { ReactNode } from "react";

type EntitySummaryCardProps = {
  visual: ReactNode;
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
};

export function EntitySummaryCard({ visual, title, meta, action, children }: EntitySummaryCardProps) {
  return (
    <section className="border-y border-border py-5 sm:py-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {visual}
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {meta ? <div className="mt-1.5 text-sm text-muted-foreground">{meta}</div> : null}
        </div>
        {action ? <div className="shrink-0 self-start sm:self-auto">{action}</div> : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
