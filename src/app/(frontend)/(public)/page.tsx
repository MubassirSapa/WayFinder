import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-6 py-12 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Indoor Map
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Temporary project homepage for indoor navigation and mapping.
            </h1>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/admin" />}
            size="lg"
            variant="outline"
          >
            Open admin
          </Button>
        </header>

        <main className="grid gap-10 py-12 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              This is a temporary landing page for the Indoor Map capstone. The
              goal is to help users explore complex buildings, find rooms and
              services faster, and give organizations a clean way to manage
              indoor layouts.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
                <p className="text-sm font-semibold text-primary">Search</p>
                <h2 className="mt-2 text-lg font-semibold">Find places fast</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Search rooms, offices, stores, and entrances from a single
                  interface.
                </p>
              </article>
              <article className="rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
                <p className="text-sm font-semibold text-primary">Navigate</p>
                <h2 className="mt-2 text-lg font-semibold">Understand routes</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Show hallways, elevators, stairs, and important wayfinding
                  paths.
                </p>
              </article>
              <article className="rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
                <p className="text-sm font-semibold text-primary">Manage</p>
                <h2 className="mt-2 text-lg font-semibold">Update maps easily</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Let admins maintain indoor spaces without rebuilding the app.
                </p>
              </article>
            </div>
          </div>

          <aside className="rounded-4xl border border-border bg-secondary p-7 text-secondary-foreground shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Current focus
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-secondary-foreground/80">
              <li className="rounded-2xl border border-border bg-background/60 p-4">
                Build a usable map viewer for multi-room indoor spaces.
              </li>
              <li className="rounded-2xl border border-border bg-background/60 p-4">
                Add searchable locations with labels and categories.
              </li>
              <li className="rounded-2xl border border-border bg-background/60 p-4">
                Prepare an admin workflow for uploading and editing map data.
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                nativeButton={false}
                render={<Link href="/admin" />}
                size="lg"
              >
                Admin panel
              </Button>
              <Button
                nativeButton={false}
                render={
                  <a
                    href="https://payloadcms.com/docs"
                    rel="noopener noreferrer"
                    target="_blank"
                  />
                }
                size="lg"
                variant="secondary"
              >
                Payload docs
              </Button>
            </div>
          </aside>
        </main>

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          Temporary page for the Indoor Map project. Replace this with the real
          product experience as frontend work starts landing.
        </footer>
      </div>
    </section>
  );
}
