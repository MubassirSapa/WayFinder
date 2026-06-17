import type { Metadata } from "next";

import ResetPasswordSection from "@/features/auth/reset-password/sections/ResetPasswordSection";
import { BRAND } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Create New Password | ${BRAND.NAME}`,
};

export default async function ResetPasswordPage({ searchParams }: TProps) {
  const { token } = await searchParams;

  return <ResetPasswordSection token={token} />;
}

type TProps = {
  searchParams: Promise<{ token?: string }>;
};
