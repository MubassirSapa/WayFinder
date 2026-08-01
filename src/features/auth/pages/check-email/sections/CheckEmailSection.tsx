"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheckIcon } from "lucide-react";

import FormCard from "@/components/shared/form/FormCard";
import { Button } from "@/components/ui/button";
import { CHECK_EMAIL_CLIENT as CLIENT } from "@/features/auth/constants/check-email";
import { PUBLIC_ROUTES } from "@/constants/routes";

const CheckEmailSection = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(10);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <FormCard
      title={CLIENT.TITLE}
      description={CLIENT.DESC}
      backHref={PUBLIC_ROUTES.HOME}
      align="center"
      icon={<MailCheckIcon className="size-8 text-primary" strokeWidth={1.75} />}
      footer={
        secondsRemaining > 0 ? (
          <p className="text-center text-sm text-muted-foreground" aria-live="polite">
            {CLIENT.TIMER(secondsRemaining)}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              {CLIENT.OTHER_DEVICE_DESC}
            </p>
            <Button
              nativeButton={false}
              render={<Link href={PUBLIC_ROUTES.SIGNIN} />}
              size="lg"
              className="h-10 w-full rounded-lg text-sm font-semibold"
            >
              {CLIENT.SIGNIN_CTA}
            </Button>
          </div>
        )
      }
    />
  );
};

export default CheckEmailSection;
