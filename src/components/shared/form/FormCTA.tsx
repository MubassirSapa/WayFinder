import Link from "next/link";

import { cn } from "@/lib/utils";

const FormCTA = ({ label, linkLabel, href, isSubmitting }: TProps) => {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {label}{" "}
      <Link
        href={href}
        className={cn(
          "font-semibold text-primary underline-offset-4 hover:underline",
          isSubmitting && "pointer-events-none opacity-50",
        )}
      >
        {linkLabel}
      </Link>
    </p>
  );
};

export default FormCTA;

type TProps = {
  label: string;
  linkLabel: string;
  href: string;
  isSubmitting?: boolean;
};
