import type { Metadata } from "next";

import RegisterOrganizationSection from "@/features/auth/pages/register-organization/sections/RegisterOrganizationSection";
import { BRAND } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Register Your Organization | ${BRAND.NAME}`,
};

export default function RegisterOrganizationPage() {
  return <RegisterOrganizationSection />;
}
