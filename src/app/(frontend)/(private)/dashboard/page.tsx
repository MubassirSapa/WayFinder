import type { Metadata } from "next";

import { BRAND } from "@/constants/brand";
import { DASHBOARD_CLIENT } from "@/features/dashboard/constants/dashboard.constants";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { getDashboardData } from "@/features/dashboard/services/server/getDashboardData";

export const metadata: Metadata = {
  title: `${DASHBOARD_CLIENT.PAGE_TITLE} | ${BRAND.NAME}`,
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardShell data={data} />;
}
