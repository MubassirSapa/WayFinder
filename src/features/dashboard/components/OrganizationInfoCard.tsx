import type { ReactNode } from "react";
import Image from "next/image";
import { LandmarkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { EntitySummaryCard } from "./EntitySummaryCard";

type OrganizationInfoCardProps = {
  name: string;
  typeLabel: string;
  logoUrl: string | null;
  action?: ReactNode;
  children?: ReactNode;
};

export function OrganizationInfoCard({ name, typeLabel, logoUrl, action, children }: OrganizationInfoCardProps) {
  return (
    <EntitySummaryCard
      visual={
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/20 bg-primary/10 sm:size-18">
          {logoUrl ? (
            <Image alt={name} src={logoUrl} fill sizes="80px" className="object-cover" unoptimized />
          ) : (
            <LandmarkIcon className="size-7 text-primary" />
          )}
        </div>
      }
      title={name}
      meta={<Badge variant="outline" className="uppercase tracking-wide">{typeLabel}</Badge>}
      action={action}
    >
      {children}
    </EntitySummaryCard>
  );
}
