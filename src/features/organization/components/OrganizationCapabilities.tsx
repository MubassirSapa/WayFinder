import { Accessibility, Navigation, RefreshCw } from "lucide-react";

const capabilities = [
  {
    icon: RefreshCw,
    title: "Keep information current",
    description: "Update floors and destinations when your building changes.",
  },
  {
    icon: Navigation,
    title: "Help visitors find their way",
    description: "Give people a clear path to the destination they need.",
  },
  {
    icon: Accessibility,
    title: "Support accessible journeys",
    description: "Make step-free and accessible routes easier to discover.",
  },
] as const;

export function OrganizationCapabilities() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
      {capabilities.map((capability) => {
        const Icon = capability.icon;

        return (
          <article
            className="flex min-h-56 flex-col items-center justify-center rounded-md border border-border bg-card px-5 py-7 text-center text-card-foreground"
            key={capability.title}
          >
            <Icon className="size-9 text-primary" strokeWidth={1.7} aria-hidden />
            <h2 className="mt-5 text-base font-semibold text-foreground">{capability.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {capability.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
