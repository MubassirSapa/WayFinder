import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const FormAlert = ({ title, errorMessage, successMessage }: TProps) => {
  if (!errorMessage && !successMessage) return null;

  const isError = Boolean(errorMessage);
  const alertTitle = title ?? (isError ? "Error" : "Success");
  const message = errorMessage || successMessage;

  return (
    <Alert
      className={cn(
        "w-full max-w-md rounded-xl",
        isError
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-primary/30 bg-primary/5 text-primary",
      )}
    >
      <AlertTitle>{alertTitle}</AlertTitle>
      <AlertDescription className="text-wrap">{message}</AlertDescription>
    </Alert>
  );
};

export default FormAlert;

type TProps = {
  title?: string;
  errorMessage?: string;
  successMessage?: string;
};
