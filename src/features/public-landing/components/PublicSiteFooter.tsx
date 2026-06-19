import Link from "next/link";

export function PublicSiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Link className="font-semibold text-primary" href="/">
          Wayfinder
        </Link>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link className="hover:text-foreground" href="/about">
            About
          </Link>
          <Link className="hover:text-foreground" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-foreground" href="/terms">
            Terms of Service
          </Link>
        </div>
        <p>2026 Wayfinder. All rights reserved.</p>
      </div>
    </footer>
  );
}
