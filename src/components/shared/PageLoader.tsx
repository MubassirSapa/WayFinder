import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  className?: string;
  label?: string;
  showBrand?: boolean;
};

// The Suspense fallback Next.js swaps in via loading.tsx while a route
// segment's async server work resolves - kept deliberately plain (brand
// mark + spinner) since it's often on screen for well under a second.
export function PageLoader({ className, label = "Loading...", showBrand = true }: PageLoaderProps) {
  return (
    <div
      className={cn("flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center", className)}
      role="status"
    >
      {showBrand ? <WayfinderBrand className="opacity-90" /> : null}
      <Spinner className="size-5 text-primary" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
