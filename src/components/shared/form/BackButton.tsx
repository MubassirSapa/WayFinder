"use client";

import { useRouter } from "nextjs-toploader/app";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BackButton = ({ href, className, showLabel = true }: TProps) => {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Go back"
      onClick={() => (href ? router.push(href) : router.back())}
      className={cn("-ms-2 gap-1.5 px-2 text-muted-foreground hover:text-foreground", className)}
    >
      <ArrowLeftIcon className="size-4" />
      {showLabel && <span className="text-sm">Back</span>}
    </Button>
  );
};

export default BackButton;

type TProps = {
  href?: string;
  className?: string;
  showLabel?: boolean;
};
