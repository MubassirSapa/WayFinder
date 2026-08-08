import { PageLoader } from "@/components/shared/PageLoader";

export default function ViewersLoading() {
  return <PageLoader className="min-h-dvh bg-background text-foreground" label="Loading page..." />;
}
