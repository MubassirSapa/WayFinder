import { redirect } from "next/navigation";

import { PUBLIC_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/services/auth/auth.ports";

export default async function PrivateLayout({ children }: TProps) {
  const user = await getCurrentUser();

  if (!user.isSuccess) {
    redirect(PUBLIC_ROUTES.SIGNIN);
  }

  return children;
}

type TProps = Readonly<{ children: React.ReactNode }>;
