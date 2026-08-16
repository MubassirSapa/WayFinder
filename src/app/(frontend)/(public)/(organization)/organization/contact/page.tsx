import type { Metadata } from "next";

import { ContactPage } from "@/features/organization/pages/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us | Wayfinder",
  description: "Get in touch with the Wayfinder team about bringing indoor mapping to your organization.",
};

export default function OrganizationContactRoute() {
  return <ContactPage />;
}
