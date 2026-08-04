import { AppTopbar } from "@/features/dashboard/components/AppTopbar";
import { AppSidebar } from "@/features/dashboard/components/AppSidebar";
import { getTopbarUser } from "@/features/dashboard/services/server/getTopbarUser";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function DashboardLayout({ children }: TProps) {
  const user = await getTopbarUser();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset className="min-w-0 bg-background text-foreground">
          <AppTopbar user={user} />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

type TProps = Readonly<{ children: React.ReactNode }>;
