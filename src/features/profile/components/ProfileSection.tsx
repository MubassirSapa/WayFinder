import type { ReactNode } from "react";

type ProfileSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ProfileSection({ title, description, children }: ProfileSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5 px-4 py-5 sm:px-5">{children}</div>
    </section>
  );
}
