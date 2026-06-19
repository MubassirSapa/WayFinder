import type { Metadata } from "next";
import Link from "next/link";

import { BRAND } from "@/constants/brand";
import { PUBLIC_ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: `Terms | ${BRAND.NAME}`,
};

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-10 text-foreground sm:px-6">
      <article className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
        <Link href={PUBLIC_ROUTES.SIGNUP} className="text-sm font-medium text-primary hover:underline">
          Back to sign up
        </Link>
        <h1 className="mt-6 font-heading text-3xl font-semibold tracking-normal">Terms of Use</h1>
        <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            By creating a {BRAND.NAME} account, you agree to use the platform for authorized indoor mapping and facility navigation work only.
          </p>
          <p>
            You are responsible for the accuracy of organization, floor, path, and object information entered into the system.
          </p>
          <p>
            Do not upload or publish content that you do not have permission to manage. Access can be limited or removed if the workspace is misused.
          </p>
        </div>
      </article>
    </main>
  );
}
