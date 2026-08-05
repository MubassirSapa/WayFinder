import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardPageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
};

export function DashboardPageHeader({
  title,
  description,
  action,
  backHref,
  backLabel,
  className,
}: DashboardPageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {backHref && backLabel ? (
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0 self-start sm:self-auto">{action}</div> : null}
    </header>
  );
}

export function DashboardBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
      {label}
    </Link>
  );
}

export function DashboardPageContainer({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-270 flex-1 flex-col gap-8 px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      {children}
    </main>
  );
}
