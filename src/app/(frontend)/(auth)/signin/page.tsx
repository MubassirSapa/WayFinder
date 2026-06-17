import type { Metadata } from "next";

import SigninSection from "@/features/auth/signin/sections/SigninSection";
import { BRAND } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Sign In | ${BRAND.NAME}`,
};

export default function SigninPage() {
  return <SigninSection />;
}
