"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Building2Icon, LogOutIcon, MoonIcon, UserIcon } from "lucide-react";

import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { applyTheme, useIsDarkTheme } from "@/components/shared/theme/ModeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { logoutAction } from "@/features/auth/actions/server/logout";

import { DASHBOARD_CLIENT } from "../constants/dashboard.constants";
import type { TopbarUser } from "../types/dashboard.types";
import { UserAvatar } from "./UserAvatar";

type AppTopbarProps = {
  user: TopbarUser;
};

export function AppTopbar({ user }: AppTopbarProps) {
  const { setTheme } = useTheme();
  const isDark = useIsDarkTheme();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, startLogout] = useTransition();
  const canManage = user.role === "owner" || user.role === "manager";

  const logout = () => {
    startLogout(async () => {
      await logoutAction();
    });
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <WayfinderBrand
              href={PRIVATE_ROUTES.DASHBOARD}
              className="md:hidden"
              iconClassName="size-7"
              textClassName="text-base"
            />
          </div>

          <div className="flex items-center">
            <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full outline-none">
              <UserAvatar user={user} />
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-medium text-foreground">{user.name}</span>
                <span className="block text-xs capitalize text-muted-foreground">{user.role}</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 max-w-[calc(100vw-2rem)]">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex min-w-0 items-center gap-3 p-3">
                  <UserAvatar user={user} className="size-10" />
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground" title={user.email}>
                      {user.email}
                    </span>
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {canManage ? (
                  <DropdownMenuItem render={<Link href={PRIVATE_ROUTES.ORGANIZATION} />}>
                    <Building2Icon />
                    {DASHBOARD_CLIENT.NAV_ORGANIZATION}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem render={<Link href={PRIVATE_ROUTES.PROFILE} />}>
                  <UserIcon />
                  {DASHBOARD_CLIENT.NAV_PROFILE}
                </DropdownMenuItem>
                <div className="flex items-center justify-between gap-3 px-2 py-1.5 text-sm">
                  <span className="flex items-center gap-2">
                    <MoonIcon className="size-4" />
                    {DASHBOARD_CLIENT.THEME_DARK}
                  </span>
                  <Switch
                    aria-label={DASHBOARD_CLIENT.THEME_DARK}
                    checked={isDark}
                    onCheckedChange={(checked) => applyTheme(checked ? "dark" : "light", setTheme)}
                  />
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isLoggingOut}
                  onClick={() => setIsLogoutOpen(true)}
                >
                  <LogOutIcon />
                  {DASHBOARD_CLIENT.LOG_OUT}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{DASHBOARD_CLIENT.LOG_OUT_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{DASHBOARD_CLIENT.LOG_OUT_DESCRIPTION}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>{DASHBOARD_CLIENT.CANCEL}</AlertDialogCancel>
            <AlertDialogAction disabled={isLoggingOut} onClick={logout}>
              <LogOutIcon />
              {DASHBOARD_CLIENT.LOG_OUT}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
