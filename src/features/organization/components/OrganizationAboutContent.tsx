import { Building2, MapPin, QrCode, RefreshCw, Route, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Your team maps the building",
    description: "Draw rooms, floors, and paths the way your building actually works. No developer required.",
  },
  {
    number: "02",
    title: "Publish when a floor is ready",
    description: "Floors stay in draft while you work. Nothing goes live until you publish it, floor by floor.",
  },
  {
    number: "03",
    title: "Visitors search and go",
    description: "No account, no app. A visitor picks a destination and gets walked there.",
  },
] as const;

const orgBenefits = [
  {
    icon: Building2,
    title: "Every building in one place",
    description: "Manage all of your organization's buildings and floors from a single dashboard.",
  },
  {
    icon: Users,
    title: "Your team, your roles",
    description: "Invite teammates as owner, manager, or member, so the right people can edit the right buildings.",
  },
  {
    icon: RefreshCw,
    title: "Update anytime, publish when ready",
    description: "Fix a room, add a floor, or change a route whenever you need to. Nothing goes live until you say so.",
  },
] as const;

const visitorBenefits = [
  {
    icon: MapPin,
    title: "No app, no account",
    description: "Visitors just open the map and search. Nothing to download, nothing to sign up for.",
  },
  {
    icon: Route,
    title: "A route, not a guess",
    description: "Visitors pick a destination and get a calculated path there, across floors if the building needs it, with a step-free option when they need one.",
  },
  {
    icon: QrCode,
    title: "Scan a QR, start right there",
    description: "A printed sticker on any room drops a visitor straight into directions from exactly where they're standing.",
  },
] as const;

export function OrganizationAboutContent() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-5 pb-10 pt-12 text-center sm:px-6 sm:pt-16 lg:pt-20">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Built to answer the question a floor plan can&apos;t.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            A picture of a building shows what it looks like. It can&apos;t tell a visitor how to
            get from where they are to where they need to be. Wayfinder can.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-14">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your map, always under your control
          </h2>
          <div className="mt-4 rounded-md border border-border bg-card p-5 sm:p-6">
            <p className="text-base leading-8 text-card-foreground">
              You and your team own the map. Update it whenever a room changes, a floor gets
              renovated, or a route needs fixing. Nothing goes out to visitors until you publish
              it, so you decide exactly what&apos;s public and when.
            </p>
          </div>

          <h2 className="mt-12 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:mt-14">
            How it works
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
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Built for your team
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Everything an owner or manager needs to keep the map current, without needing a
              developer.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
            {orgBenefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  className="flex min-h-48 flex-col items-center justify-center rounded-md border border-border bg-card px-5 py-7 text-center text-card-foreground"
                  key={benefit.title}
                >
                  <Icon className="size-8 text-primary" strokeWidth={1.7} aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {benefit.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              What your visitors get
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              No more wandering a hallway hoping they picked the right turn.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
            {visitorBenefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  className="flex min-h-48 flex-col items-center justify-center rounded-md border border-border bg-card px-5 py-7 text-center text-card-foreground"
                  key={benefit.title}
                >
                  <Icon className="size-8 text-primary" strokeWidth={1.7} aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {benefit.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
