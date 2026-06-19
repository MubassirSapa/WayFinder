import type { Metadata } from "next";
import Link from "next/link";

import { BRAND } from "@/constants/brand";
import { PUBLIC_ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: `Privacy | ${BRAND.NAME}`,
};

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-10 text-foreground sm:px-6">
      <article className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
        <Link href={PUBLIC_ROUTES.SIGNUP} className="text-sm font-medium text-primary hover:underline">
          Back to sign up
        </Link>
        <h1 className="mt-6 font-heading text-3xl font-semibold tracking-normal">Privacy Policy</h1>
        <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            {BRAND.NAME} stores account, organization, and map editor data needed to operate your indoor mapping workspace.
          </p>
          <p>
            Verification and password reset emails are sent through the configured email provider. Authentication is handled through secure Payload sessions.
          </p>
          <p>
            Only authorized users should access private editor routes and organization data.
          </p>
        </div>
      </article>
    </main>
  );
}
