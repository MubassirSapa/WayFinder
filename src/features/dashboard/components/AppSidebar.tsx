"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2Icon, LandmarkIcon, LayoutDashboardIcon, UsersIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { BRAND } from "@/constants/brand";

import { DASHBOARD_CLIENT } from "../constants/dashboard.constants";
import type { TopbarUser } from "../types/dashboard.types";

export function AppSidebar({ user }: { user: TopbarUser }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const canManage = user.role === "owner" || user.role === "manager";
  const items = [
    { href: PRIVATE_ROUTES.DASHBOARD, label: DASHBOARD_CLIENT.NAV_DASHBOARD, icon: LayoutDashboardIcon, exact: true },
    ...(canManage
      ? [
          { href: PRIVATE_ROUTES.ORGANIZATION, label: DASHBOARD_CLIENT.NAV_ORGANIZATION, icon: LandmarkIcon },
        ]
      : []),
    { href: PRIVATE_ROUTES.BUILDINGS, label: DASHBOARD_CLIENT.NAV_BUILDINGS, icon: Building2Icon },
    ...(canManage
      ? [{ href: PRIVATE_ROUTES.USERS, label: DASHBOARD_CLIENT.NAV_USERS, icon: UsersIcon }]
      : []),
  ];

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col-reverse group-data-[collapsible=icon]:gap-2">
          <SidebarMenu className="min-w-0 flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href={PRIVATE_ROUTES.DASHBOARD} onClick={() => setOpenMobile(false)} />}
                size="lg"
                tooltip={DASHBOARD_CLIENT.PAGE_TITLE}
                className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
              >
                <span className="relative flex aspect-square size-8 shrink-0 items-center justify-center before:absolute before:inset-1 before:rounded-full before:bg-(--brand-glow) before:blur-sm">
                  <Image
                    alt=""
                    className="z-10 object-contain"
                    fill
                    sizes="32px"
                    src="/icon/wayfinder-no-bg.png"
                  />
                </span>
                <span className="truncate text-lg font-semibold tracking-normal text-foreground group-data-[collapsible=icon]:hidden">
                  {BRAND.NAME}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarTrigger className="hidden shrink-0 lg:flex" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} onClick={() => setOpenMobile(false)} />}
                      isActive={active}
                      tooltip={item.label}
                      size="lg"
                      className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                    >
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
