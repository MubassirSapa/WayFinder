import { PageLoader } from "@/components/shared/PageLoader";

// The sidebar/topbar (dashboard/layout.tsx) are already mounted and stay on
// screen - this only covers the content area while a specific dashboard
// page's own data is loading, so the brand mark isn't repeated here.
export default function DashboardLoading() {
  return <PageLoader className="min-h-[50vh]" label="Loading..." showBrand={false} />;
}
