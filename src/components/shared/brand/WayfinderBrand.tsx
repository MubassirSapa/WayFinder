import Link from "next/link";
import { Compass } from "lucide-react";

import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

type WayfinderBrandProps = {
  href?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

export function WayfinderBrand({
  href,
  className,
  iconClassName,
  textClassName,
}: WayfinderBrandProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[0_0_22px_color-mix(in_oklch,var(--primary),transparent_60%)]",
          iconClassName,
        )}
      >
        <Compass className="size-4" aria-hidden />
      </span>
      <span className={cn("text-lg font-semibold tracking-normal text-foreground", textClassName)}>
        {BRAND.NAME}
      </span>
    </>
  );

  if (href) {
    return (
      <Link className={cn("inline-flex items-center gap-3", className)} href={href}>
        {content}
      </Link>
    );
  }

  return <div className={cn("inline-flex items-center gap-3", className)}>{content}</div>;
}
