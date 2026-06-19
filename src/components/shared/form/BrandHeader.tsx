import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { BRAND } from "@/constants/brand";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const BrandHeader = ({ className }: TProps) => {
  return (
    <Link
      href={PUBLIC_ROUTES.HOME}
      className={cn(
        "inline-flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80",
        className,
      )}
    >
      <span className="grid size-9 place-content-center rounded-lg bg-primary/10 text-primary">
        <CompassIcon className="size-5" strokeWidth={2.25} />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">{BRAND.NAME}</span>
    </Link>
  );
};

export default BrandHeader;

type TProps = {
  className?: string;
};
