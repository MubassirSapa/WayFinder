import { Accessibility, Layers, ListChecks, MapPinned, Navigation, Search } from "lucide-react";
import Link from "next/link";

import { VideoPlayer } from "@/components/shared/media/VideoPlayer";
import { Button } from "@/components/ui/button";
import { MARKETING_VIDEOS } from "@/constants/videos";
import { PUBLIC_ROUTES } from "@/constants/routes";

const navigationSteps = [
  {
    description: "Search the building directory and open the one you plan to visit.",
    icon: Search,
    title: "Find your building",
  },
  {
    description: "See every available floor together and choose the one you need.",
    icon: Layers,
    title: "Choose the floor",
  },
  {
    description: "Open the indoor map and follow the route to the right destination.",
    icon: Navigation,
    title: "Navigate inside",
  },
] as const;

const designPrinciples = [
  {
    description: "Buildings, floors, and destinations are presented in a predictable order.",
    icon: MapPinned,
    title: "Start with the place",
  },
  {
    description: "Visitors make only the decisions needed to open the correct indoor map.",
    icon: ListChecks,
    title: "Keep choices focused",
  },
  {
    description: "Step-free routes and readable controls support more confident journeys.",
    icon: Accessibility,
    title: "Design for access",
  },
] as const;

export function ViewerAboutContent() {
  return (
    <>
      <section className="overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-7 px-5 py-10 sm:gap-9 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:gap-12 lg:py-14">
          <div className="max-w-2xl">
            <h1 className="text-pretty text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Indoor navigation without the guesswork.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Wayfinder helps people choose the right building and floor before guiding them
              through the space to their destination.
            </p>
          </div>

          <div>
            <VideoPlayer src={MARKETING_VIDEOS.DEMO} title="Wayfinder demo" />
          </div>
        </div>
      </section>

      <section aria-labelledby="how-wayfinder-works" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
          <div className="max-w-2xl">
            <h2
              className="text-2xl font-semibold text-foreground sm:text-3xl"
              id="how-wayfinder-works"
            >
              From search to destination
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Wayfinder keeps the journey focused on three clear decisions.
            </p>
          </div>

          <ol className="mt-7 grid gap-7 md:grid-cols-3 md:gap-8">
            {navigationSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <li className="border-t border-border pt-5" key={step.title}>
                  <div className="flex items-center justify-between gap-4">
                    <Icon className="size-6 text-primary" aria-hidden />
                    <span className="text-sm font-semibold text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-center lg:gap-14">
        <div>
          <h2 className="max-w-md text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            Clear information at every step.
          </h2>
          <p className="mt-4 max-w-md leading-7 text-muted-foreground">
            The interface stays useful whether someone is planning ahead or already standing at
            the entrance.
          </p>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {designPrinciples.map((principle) => {
            const Icon = principle.icon;

            return (
              <div
                className="grid gap-4 py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)]"
                key={principle.title}
              >
                <Icon className="size-6 text-primary" aria-hidden />
                <div>
                  <h3 className="font-semibold text-foreground">{principle.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {principle.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-primary/20 bg-primary/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 sm:px-6 sm:py-9 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-foreground">Manage a public building?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              See how organizations create, maintain, and share their own indoor maps.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href={PUBLIC_ROUTES.ORGANIZATION} />}
            className="h-11 px-6 text-sm"
          >
            For organizations
          </Button>
        </div>
      </section>
    </>
  );
}
