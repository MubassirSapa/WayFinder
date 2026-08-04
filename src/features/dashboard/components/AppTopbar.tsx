"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowUpRightIcon, Building2Icon, LogOutIcon, MoonIcon, SunIcon, UserIcon, UsersIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { logoutAction } from "@/features/auth/actions/server/logout";

import { DASHBOARD_CLIENT } from "../constants/dashboard.constants";
import type { TopbarUser } from "../types/dashboard.types";

type AppTopbarProps = {
  user: TopbarUser;
};

export function AppTopbar({ user }: AppTopbarProps) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const isDark = useIsDarkTheme();
  const [isLoggingOut, startLogout] = useTransition();
  const canManage = user.role === "owner" || user.role === "manager";

  const navLinks = canManage
    ? [{ href: PRIVATE_ROUTES.USERS, label: DASHBOARD_CLIENT.NAV_USERS, icon: UsersIcon }]
    : [];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link href={PRIVATE_ROUTES.DASHBOARD} className="shrink-0 font-heading text-lg font-semibold tracking-tight text-foreground">
          {BRAND.NAME}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
                  : "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              <link.icon className="size-3.5" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href={PUBLIC_ROUTES.HOME}
            className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <ArrowUpRightIcon className="size-3.5" />
            {DASHBOARD_CLIENT.VIEW_PUBLIC}
          </Link>
          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full outline-none">
              <Avatar>
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                <AvatarFallback>{user.initial}</AvatarFallback>
              </Avatar>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-medium text-foreground">{user.name}</span>
                <span className="block text-xs capitalize text-muted-foreground">{user.role}</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
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
                <DropdownMenuItem onClick={() => applyTheme(isDark ? "light" : "dark", setTheme)}>
                  {isDark ? <SunIcon /> : <MoonIcon />}
                  {isDark ? DASHBOARD_CLIENT.THEME_LIGHT : DASHBOARD_CLIENT.THEME_DARK}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isLoggingOut}
                  onClick={() => startLogout(async () => { await logoutAction(); })}
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
  );
}
