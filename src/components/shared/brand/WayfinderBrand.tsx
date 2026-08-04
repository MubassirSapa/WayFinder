import Image from "next/image";
import Link from "next/link";

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
          "relative block size-8 before:absolute before:inset-1 before:rounded-full before:bg-[var(--brand-glow)] before:blur-sm",
          iconClassName,
        )}
      >
        <Image
          alt=""
          className="z-10 object-contain"
          fill
          sizes="32px"
          src="/icon/wayfinder-no-bg.png"
        />
      </span>
      <span
        className={cn(
          "text-lg font-semibold tracking-normal text-foreground",
          textClassName,
        )}
      >
        {BRAND.NAME}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        className={cn("inline-flex items-center gap-3", className)}
        href={href}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      {content}
    </div>
  );
}
