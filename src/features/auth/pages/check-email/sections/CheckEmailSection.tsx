"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import FormCard from "@/components/shared/form/FormCard";
import { Button } from "@/components/ui/button";
import { CHECK_EMAIL_CLIENT as CLIENT } from "@/features/auth/constants/check-email";
import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import AuthHeroVisual from "@/features/auth/shared/illustrations/AuthHeroVisual";
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
    <AuthSplitFrame
      illustration={
        <AuthHeroVisual
          badgeLabel="Message sent"
          destinationLabel="Inbox"
          floorLabel="Ground - Entrance"
          markerIcon={Mail}
        />
      }
      illustrationHeadline="Your link is on its way."
      illustrationSide="right"
    >
      <FormCard
        title={CLIENT.TITLE}
        description={CLIENT.DESC}
        align="center"
        plain
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
    </AuthSplitFrame>
  );
};

export default CheckEmailSection;
