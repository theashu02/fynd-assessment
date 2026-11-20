"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { SIDEBAR_CTA, SIDEBAR_ROUTES, isRouteActive, type SidebarRoute } from "./sidebar-data";
import { SidebarTip } from "./sidebar-tip";

function SidebarNavItem({
  route,
  active,
  collapsed,
}: {
  route: SidebarRoute;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <SidebarTip label={route.name} collapsed={collapsed}>
      <Button
        asChild
        variant="ghost"
        className={cn(
          "relative h-10 w-full gap-3 px-3 text-sm font-medium",
          collapsed && "justify-center px-0",
          !collapsed && "justify-start",
          active
            ? "bg-inkband text-white hover:bg-inkband hover:text-white"
            : "text-muted-foreground hover:bg-mist hover:text-foreground",
        )}
      >
        <Link href={route.href} aria-current={active ? "page" : undefined}>
          <span
            className={cn(
              "absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 bg-accent",
              active ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />
          <route.icon
            className={cn("h-5 w-5 shrink-0", active && "text-accent")}
            aria-hidden="true"
          />
          {!collapsed && <span className="truncate">{route.name}</span>}
        </Link>
      </Button>
    </SidebarTip>
  );
}

type SidebarNavProps = {
  pathname: string | null;
  collapsed: boolean;
};

export function SidebarNav({ pathname, collapsed }: SidebarNavProps) {
  return (
    <>
      <div className="px-3 pt-4">
        <SidebarTip label="Create new order" collapsed={collapsed}>
          <Button
            asChild
            className={cn(
              "h-10 w-full gap-2 rounded-none bg-accent text-sm font-bold text-white hover:bg-[#C2410C] hover:text-white",
              collapsed && "justify-center px-0",
            )}
          >
            <Link href={SIDEBAR_CTA.href}>
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{SIDEBAR_CTA.label}</span>}
            </Link>
          </Button>
        </SidebarTip>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
            Menu
          </p>
        )}
        {SIDEBAR_ROUTES.map((route) => (
          <SidebarNavItem
            key={route.href}
            route={route}
            active={isRouteActive(pathname, route.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </>
  );
}
