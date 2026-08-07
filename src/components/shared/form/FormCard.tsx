import BrandHeader from "./BrandHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FormCard = ({
  title,
  description,
  icon,
  children,
  content,
  footer,
  align = "start",
  eyebrow,
}: TProps) => {
  return (
    <Card className="w-full gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 text-card-foreground shadow-sm">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="mb-7">
          <BrandHeader />
        </div>

        <div
          className={cn(
            "flex gap-3",
            icon && align !== "center" ? "items-start" : "flex-col",
            align === "center" && "items-center",
          )}
        >
          {icon && (
            <div className="grid size-10 shrink-0 place-content-center rounded-md border border-primary/15 bg-primary/10 text-primary">
              {icon}
            </div>
          )}

          <div
            className={cn(
              "space-y-2",
              align === "center" ? "text-center" : "text-start",
              footer || content || children ? "mb-6" : "mb-2",
            )}
          >
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {eyebrow}
              </p>
            )}
            <h1 className="font-heading text-2xl font-semibold leading-tight tracking-normal text-foreground">
              {title}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      {(content ?? children) && (
        <CardContent className="px-5 pb-2 sm:px-6">{content ?? children}</CardContent>
      )}

      {footer && (
        <CardFooter className="flex-col gap-4 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default FormCard;

type TProps = {
  title: string;
  description: string;
  showBack?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  align?: "start" | "center";
  eyebrow?: string;
};
