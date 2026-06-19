import type { Metadata } from "next";

import ForgotPasswordSection from "@/features/auth/pages/forgot-password/sections/ForgotPasswordSection";
import { BRAND } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Reset Password | ${BRAND.NAME}`,
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordSection />;
}
