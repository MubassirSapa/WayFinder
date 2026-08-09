import { cn } from "@/lib/utils";

/**
 * Two-column auth frame: a decorative illustration panel beside the form.
 * Below `lg`, the illustration panel drops entirely and this renders
 * identically to the plain single-column AuthFrame it replaces for pages
 * that opt into it.
 */
const AuthSplitFrame = ({ children, illustration, illustrationHeadline, illustrationSide }: TProps) => {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-background text-foreground lg:flex-row">
      <div
        aria-hidden
        className={cn(
          "relative hidden items-center justify-center overflow-hidden bg-muted/40 lg:flex lg:w-1/2",
          illustrationSide === "right" && "lg:order-2",
        )}
      >
        <div className="flex w-full max-w-xl flex-col items-center gap-5 px-8">
          {illustration}
          {illustrationHeadline && (
            <div className="flex animate-in flex-col items-center gap-3 fade-in slide-in-from-bottom-2 duration-700">
              <span className="h-px w-10 bg-primary/50" />
              <p className="max-w-md text-center font-heading text-2xl font-semibold leading-snug tracking-tight text-foreground">
                {illustrationHeadline}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-4 py-6 sm:px-6 sm:py-10 lg:py-16">
        <div className="w-full max-w-140 lg:max-w-110">{children}</div>
      </div>
    </main>
  );
};

export default AuthSplitFrame;

type TProps = Readonly<{
  children: React.ReactNode;
  illustration: React.ReactNode;
  illustrationHeadline?: React.ReactNode;
  illustrationSide: "left" | "right";
}>;
