import Link from "next/link";
import { Compass, LogIn } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicSiteHeaderProps = {
  activePage?: "discover" | "about";
};

export function PublicSiteHeader({ activePage = "discover" }: PublicSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link className="flex items-center gap-2 font-semibold text-primary" href="/">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Compass className="size-4" aria-hidden />
          </span>
          <span>Wayfinder</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <Link
            className={cn(
              "transition hover:text-foreground",
              activePage === "discover" && "text-foreground",
            )}
            href="/"
          >
            Discover
          </Link>
          <Link
            className={cn(
              "transition hover:text-foreground",
              activePage === "about" && "text-foreground",
            )}
            href="/about"
          >
            About
          </Link>
          <Link className="transition hover:text-foreground" href="/#venues">
            Venues
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "hidden sm:inline-flex")}
            href="/signin"
          >
            <LogIn className="size-4" aria-hidden />
            Log in
          </Link>
          <Link className={buttonVariants({ size: "lg" })} href="/signup">
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}
