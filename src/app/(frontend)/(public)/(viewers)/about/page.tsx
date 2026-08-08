import type { Metadata } from "next";

import { ViewerAboutPage } from "@/features/viewer/pages/about/ViewerAboutPage";

export const metadata: Metadata = {
  title: "About Wayfinder | Indoor Navigation",
  description:
    "Learn how Wayfinder helps visitors find buildings, choose the right floor, and explore indoor maps.",
};

export default function AboutRoute() {
  return <ViewerAboutPage />;
}
