import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import BrandHeader from "@/components/shared/form/BrandHeader";
import { ModeToggle } from "@/components/shared/theme/ModeToggle";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";

import { DASHBOARD_CLIENT } from "../constants/dashboard.constants";
import type { DashboardUser } from "../types/dashboard.types";

type DashboardTopbarProps = {
  user: DashboardUser;
};

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <BrandHeader href={PRIVATE_ROUTES.DASHBOARD} className="shrink-0" />
          <Badge variant="outline" className="hidden uppercase tracking-wide sm:inline-flex">
            {DASHBOARD_CLIENT.BRAND_BADGE}
          </Badge>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <ModeToggle />
          <Link
            href={PUBLIC_ROUTES.HOME}
            className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <ArrowUpRightIcon className="size-3.5" />
            {DASHBOARD_CLIENT.VIEW_PUBLIC}
          </Link>
          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-content-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {user.initial}
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-medium text-foreground">{user.name}</span>
              <span className="block text-xs text-muted-foreground">
                {DASHBOARD_CLIENT.PROFILE_ROLE}
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
