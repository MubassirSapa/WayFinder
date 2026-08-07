import type { ReactNode } from "react";

type DashboardSectionHeaderProps = {
  id: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function DashboardSectionHeader({ id, title, description, action }: DashboardSectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 id={id} className="font-heading text-lg font-semibold sm:text-xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
