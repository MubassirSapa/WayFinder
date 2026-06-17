import type { Metadata } from "next";

import VerifyEmailSection from "@/features/auth/verify-email/sections/VerifyEmailSection";
import { verifyEmailAction } from "@/server-actions/auth/verify-email";
import { BRAND } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Verify Email | ${BRAND.NAME}`,
};

export default async function VerifyEmailPage({ searchParams }: TProps) {
  const { token, userId } = await searchParams;

  const result = token ? await verifyEmailAction(token, userId) : null;
  const isVerified = Boolean(result?.isSuccess);

  return <VerifyEmailSection isVerified={isVerified} />;
}

type TProps = {
  searchParams: Promise<{ token?: string; userId?: string }>;
};
