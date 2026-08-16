import type { Metadata } from "next";

import VerifyEmailSection from "@/features/auth/pages/verify-email/sections/VerifyEmailSection";
import { verifyEmailAction } from "@/features/auth/actions/server/verify-email";
import { BRAND } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Verify Email | ${BRAND.NAME}`,
};

export default async function VerifyEmailPage({ searchParams }: TProps) {
  const { token } = await searchParams;

  const result = token ? await verifyEmailAction(token) : null;
  const isVerified = Boolean(result?.isSuccess);

  return <VerifyEmailSection isVerified={isVerified} />;
}

type TProps = {
  searchParams: Promise<{ token?: string }>;
};
