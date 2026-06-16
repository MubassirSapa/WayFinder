import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const FormFieldError = ({ errors, className, ...props }: TProps) => {
  return (
    <FieldError errors={errors} className={cn("text-xs tracking-wide", className)} {...props} />
  );
};

export default FormFieldError;

type TProps = React.ComponentPropsWithoutRef<typeof FieldError> & {
  errors?: Array<{ message?: string } | undefined>;
};
