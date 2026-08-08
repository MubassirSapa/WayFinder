import { MapPinned } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Organizations prepare the map",
    description: "Teams create their building, maintain each floor, and publish what is ready.",
  },
  {
    number: "02",
    title: "Visitors choose where they are going",
    description: "People open a building, select the correct floor, and choose their destination.",
  },
  {
    number: "03",
    title: "Wayfinder shows the route",
    description: "Clear indoor directions help visitors reach the right place with confidence.",
  },
] as const;

export function OrganizationAboutContent() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
      <header className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
          <MapPinned className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
          About Wayfinder
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Help every visitor find their way, without the guesswork.
        </p>
      </header>

      <section className="mt-12 sm:mt-14">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Our mission
        </h2>
        <div className="mt-4 rounded-md border border-border bg-card p-5 sm:p-6">
          <p className="text-base leading-8 text-card-foreground">
            Wayfinder helps organizations turn complex buildings into indoor maps that are easy to
            maintain and simple for visitors to use. Finding the right room should not require
            guesswork.
          </p>
        </div>
      </section>

      <section className="mt-12 sm:mt-14">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          How Wayfinder works
        </h2>
        <ol className="mt-4 divide-y divide-border border-y border-border">
          {steps.map((step) => (
            <li
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 py-6 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-5"
              key={step.number}
            >
              <span className="text-sm font-semibold text-primary">{step.number}</span>
              <div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 sm:mt-14">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your maps stay private until you publish them
        </h2>
        <div className="mt-4 rounded-md bg-muted/40 p-5 sm:p-6">
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            Only your team can edit your building&apos;s map. Visitors only ever see the version
            you choose to make public.
          </p>
        </div>
      </section>
    </div>
  );
}
