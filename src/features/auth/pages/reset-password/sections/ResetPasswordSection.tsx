import { KeyRound } from "lucide-react";

import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import AuthHeroVisual from "@/features/auth/shared/illustrations/AuthHeroVisual";

import ResetPasswordForm from "../forms/ResetPasswordForm";

const ResetPasswordSection = ({ token }: TProps) => {
  return (
    <AuthSplitFrame
      illustration={
        <AuthHeroVisual
          badgeLabel="Unlocked"
          destinationLabel="Reception"
          floorLabel="Ground - Entrance"
          markerIcon={KeyRound}
        />
      }
      illustrationHeadline="Set a new path forward."
      illustrationSide="left"
    >
      <ResetPasswordForm token={token} />
    </AuthSplitFrame>
  );
};

export default ResetPasswordSection;

type TProps = {
  token?: string;
};
