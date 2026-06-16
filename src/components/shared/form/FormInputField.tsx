import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FormInputField = ({ className, ...props }: TProps) => {
  return (
    <Input
      className={cn(
        "h-11 rounded-md border-border bg-white text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:border-primary focus-visible:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
};

export default FormInputField;

type TProps = React.ComponentPropsWithoutRef<typeof Input>;
