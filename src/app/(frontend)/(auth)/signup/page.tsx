import type { Metadata } from "next";

import SignupSection from "@/features/auth/signup/sections/SignupSection";
import { BRAND } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Create Your Account | ${BRAND.NAME}`,
};

export default function SignupPage() {
  return <SignupSection />;
}
