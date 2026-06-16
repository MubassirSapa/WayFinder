import { ArrowRightIcon } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FormSubmitButton = ({
  isSubmitting,
  label,
  pendingLabel,
  formId,
  withArrow = true,
  className,
  ...rest
}: TProps) => {
  return (
    <Button
      type="submit"
      form={formId}
      disabled={isSubmitting}
      size="lg"
      className={cn("h-11 w-full rounded-md text-sm font-semibold", className)}
      {...rest}
    >
      {isSubmitting ? (
        <>
          <Spinner data-icon="inline-start" />
          <span>{pendingLabel || "Processing..."}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          {withArrow && <ArrowRightIcon data-icon="inline-end" className="size-4" />}
        </>
      )}
    </Button>
  );
};

export default FormSubmitButton;

type TProps = React.ComponentPropsWithoutRef<typeof Button> & {
  formId?: string;
  label: string;
  pendingLabel?: string;
  isSubmitting?: boolean;
  withArrow?: boolean;
};
