"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotFoundActions({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <div className={cn("mt-9 flex w-full flex-col gap-3 sm:flex-row", className)}>
      <Link
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 rounded-md px-5 text-sm font-semibold shadow-[0_8px_26px_color-mix(in_oklch,var(--primary),transparent_70%)]",
        )}
        href="/"
      >
        <Home className="size-4" aria-hidden />
        Back to home base
      </Link>
      <Button
        className="h-11 rounded-md px-5 text-sm font-semibold"
        size="lg"
        type="button"
        variant="outline"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retrace your steps
      </Button>
    </div>
  );
}
