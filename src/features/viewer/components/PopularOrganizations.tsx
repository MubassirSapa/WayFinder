import { Button } from "@/components/ui/button";
import { FloorPlanPreview } from "@/features/viewer/components/FloorPlanPreview";
import { cn } from "@/lib/utils";
import type { LandingOrganization } from "@/features/viewer/types";

type PopularOrganizationsProps = {
  organizations: LandingOrganization[];
  onSelect: (organization: LandingOrganization) => void;
  selectedOrganizationId?: string | null;
};

export function PopularOrganizations({
  organizations,
  onSelect,
  selectedOrganizationId = null,
}: PopularOrganizationsProps) {
  if (organizations.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="popular-organizations-heading">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl" id="popular-organizations-heading">
          Filter by organization
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Tap an organization to see its venues.</p>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 py-2 scrollbar-none sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-4 sm:w-full sm:gap-6">
          {organizations.map((organization) => {
            const isSelected = organization.id === selectedOrganizationId;

            return (
              <li className="w-20 shrink-0 sm:w-24" key={organization.id}>
                <Button
                  aria-label={`Show venues for ${organization.name}`}
                  aria-pressed={isSelected}
                  className="group h-auto w-full flex-col items-center gap-2 whitespace-normal rounded-none border-none bg-transparent p-0 text-center hover:bg-transparent focus-visible:border-transparent focus-visible:ring-0 dark:hover:bg-transparent"
                  type="button"
                  variant="ghost"
                  onClick={() => onSelect(organization)}
                >
                  <span
                    className={cn(
                      "relative flex size-16 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-primary shadow-sm transition group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background sm:size-20 sm:group-hover:-translate-y-0.5 sm:group-hover:border-primary/50 sm:group-hover:shadow-md",
                      isSelected && "border-primary/60 ring-4 ring-primary/20",
                    )}
                  >
                    <FloorPlanPreview compact imageUrl={organization.logoUrl} name={organization.name} />
                  </span>
                  <span
                    className={cn(
                      "line-clamp-2 text-xs font-medium leading-4 text-foreground sm:text-sm",
                      isSelected && "text-primary",
                    )}
                  >
                    {organization.name}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
