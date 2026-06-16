import type { Metadata } from "next";

import CheckEmailSection from "@/components/auth/check-email/sections/CheckEmailSection";
import { BRAND } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Check Your Inbox | ${BRAND.NAME}`,
};

export default function CheckEmailPage() {
  return <CheckEmailSection />;
}
