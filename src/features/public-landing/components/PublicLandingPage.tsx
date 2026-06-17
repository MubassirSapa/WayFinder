import Link from "next/link";
import { Compass, LogIn } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { LandingExplorer } from "./LandingExplorer";
import { getPublicLandingData } from "../data/getPublicLandingData";

export async function PublicLandingPage() {
  const data = await getPublicLandingData();

  return (
    <div className="min-h-screen bg-[#f4f7f7] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link className="flex items-center gap-2 font-semibold text-teal-800" href="/">
            <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Compass className="size-4" aria-hidden />
            </span>
            <span>Wayfinder</span>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
            <Link className="text-teal-800" href="/">
              Discover
            </Link>
            <Link className="transition hover:text-slate-950" href="/#venues">
              Venues
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "hidden text-slate-700 sm:inline-flex",
              )}
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

      <main id="venues">
        <LandingExplorer data={data} />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-7 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <Link className="font-semibold text-teal-800" href="/">
            Wayfinder
          </Link>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link className="hover:text-slate-950" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="hover:text-slate-950" href="/terms">
              Terms of Service
            </Link>
          </div>
          <p>2026 Wayfinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
