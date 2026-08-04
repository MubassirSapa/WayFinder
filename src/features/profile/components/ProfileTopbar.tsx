import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import BrandHeader from "@/components/shared/form/BrandHeader";
import { ModeToggle } from "@/components/shared/theme/ModeToggle";
import { PRIVATE_ROUTES } from "@/constants/routes";

import { PROFILE_CLIENT } from "../constants/profile.constants";

export function ProfileTopbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
        <BrandHeader href={PRIVATE_ROUTES.DASHBOARD} />
        <ModeToggle />
      </div>
      <div className="mx-auto w-full max-w-4xl px-4 pb-3 sm:px-6">
        <Link
          href={PRIVATE_ROUTES.DASHBOARD}
          className="inline-flex min-h-11 items-center gap-2 rounded-md pr-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          {PROFILE_CLIENT.BACK_TO_DASHBOARD}
        </Link>
      </div>
    </header>
  );
}
