"use client";

import { Menu } from "@base-ui/react/menu";
import { Menu as MenuIcon } from "lucide-react";

import { SmoothHashLink } from "@/components/shared/public-site/SmoothHashLink";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MobileSiteMenuProps = {
  activeHref?: string;
  links: readonly {
    href: string;
    label: string;
  }[];
  navigationLabel: string;
};

export function MobileSiteMenu({
  activeHref,
  links,
  navigationLabel,
}: MobileSiteMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Open ${navigationLabel}`}
        className={cn(buttonVariants({ size: "icon", variant: "ghost" }), "size-11 sm:hidden")}
      >
        <MenuIcon className="size-5" aria-hidden />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner align="end" className="z-50" sideOffset={8}>
          <Menu.Popup className="w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none">
            {links.map((link) => (
              <Menu.LinkItem
                aria-current={activeHref === link.href ? "page" : undefined}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center rounded-sm px-3 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                  activeHref === link.href && "bg-accent text-accent-foreground",
                )}
                closeOnClick
                key={link.href}
                render={<SmoothHashLink href={link.href} />}
              >
                {link.label}
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
