import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EntitySummaryCardProps = {
  visual: ReactNode;
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
};

export function EntitySummaryCard({ visual, title, meta, action, children }: EntitySummaryCardProps) {
  return (
    <Card className="gap-0 p-5 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {visual}
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {meta ? <div className="mt-1.5 text-sm text-muted-foreground">{meta}</div> : null}
        </div>
        {action ? <div className="shrink-0 self-start sm:self-auto">{action}</div> : null}
      </div>
      {children ? <div className="mt-6 border-t border-border pt-6">{children}</div> : null}
    </Card>
  );
}
