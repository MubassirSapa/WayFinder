import { OrganizationCapabilities } from "@/features/organization/components/OrganizationCapabilities";
import { OrganizationCta } from "@/features/organization/components/OrganizationCta";
import { OrganizationHero } from "@/features/organization/components/OrganizationHero";
import { OrganizationSiteShell } from "@/features/organization/components/OrganizationSiteShell";

export function OrganizationLandingPage() {
  return (
    <OrganizationSiteShell showHeaderRegistrationAction={false}>
      <OrganizationHero />
      <section
        className="border-b border-border bg-muted/20"
        aria-labelledby="organization-capabilities-heading"
      >
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h2
              className="text-2xl font-semibold text-foreground sm:text-3xl"
              id="organization-capabilities-heading"
            >
              Keep every visitor journey clear.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Keep destinations current, guide people confidently, and make accessible routes
              easier to find as your building changes.
            </p>
          </div>
          <OrganizationCapabilities />
        </div>
      </section>
      <OrganizationCta />
    </OrganizationSiteShell>
  );
}
