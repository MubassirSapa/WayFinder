import { AppTopbar } from "@/features/dashboard/components/AppTopbar";
import { getTopbarUser } from "@/features/dashboard/services/server/getTopbarUser";

export default async function DashboardLayout({ children }: TProps) {
  const user = await getTopbarUser();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AppTopbar user={user} />
      {children}
    </div>
  );
}

type TProps = Readonly<{ children: React.ReactNode }>;
