import type { Metadata } from "next";

import { PageLoader } from "@/components/shared/PageLoader";

export const metadata: Metadata = {
  title: "Loading | Wayfinder",
};

export default function LoadingPage() {
  return <PageLoader className="min-h-dvh bg-background text-foreground" label="Loading..." />;
}
