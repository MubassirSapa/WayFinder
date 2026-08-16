import { redirect } from "next/navigation";

import { PUBLIC_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";

export default async function PrivateLayout({ children }: TProps) {
  const user = await getCurrentUser();

  if (!user.isSuccess) {
    redirect(PUBLIC_ROUTES.SIGNIN);
  }

  if (!user.data.orgApproved) {
    redirect(PUBLIC_ROUTES.PENDING_APPROVAL);
  }

  return children;
}

type TProps = Readonly<{ children: React.ReactNode }>;
