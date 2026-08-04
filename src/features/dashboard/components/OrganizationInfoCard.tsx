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
};

export function OrganizationInfoCard({ name, typeLabel, logoUrl, action }: OrganizationInfoCardProps) {
  return (
    <EntitySummaryCard
      visual={
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-primary/15">
          {logoUrl ? (
            <Image alt={name} src={logoUrl} fill sizes="80px" className="object-cover" />
          ) : (
            <LandmarkIcon className="size-8 text-primary" />
          )}
        </div>
      }
      title={name}
      meta={<Badge variant="outline" className="uppercase tracking-wide">{typeLabel}</Badge>}
      action={action}
    />
  );
}
