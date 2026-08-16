import type { ReactNode } from "react";

import { OrganizationSiteFooter } from "@/features/organization/components/OrganizationSiteFooter";
import { OrganizationSiteHeader } from "@/features/organization/components/OrganizationSiteHeader";
import { OrganizationVisitorHandoff } from "@/features/organization/components/OrganizationVisitorHandoff";

type OrganizationSiteShellProps = {
  activePage?: "about" | "contact";
  children: ReactNode;
  showHeaderRegistrationAction?: boolean;
};

export function OrganizationSiteShell({
  activePage,
  children,
  showHeaderRegistrationAction = true,
}: OrganizationSiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <OrganizationSiteHeader activePage={activePage} showRegistrationAction={showHeaderRegistrationAction} />
      <OrganizationVisitorHandoff />
      <main className="flex-1">{children}</main>
      <OrganizationSiteFooter />
    </div>
  );
}
