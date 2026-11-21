"use client";

import Link from "next/link";
import { cn } from "cn";
import { SIDEBAR_ROUTES, isRouteActive, type SidebarRoute } from "./sidebar-data";
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
  const Icon = route.icon;
  return (
    <SidebarTip label={route.name} collapsed={collapsed}>
      <Link
        href={route.href}
        aria-label={route.name}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex h-10 w-full items-center rounded-md border px-3 text-[13px] font-medium transition-colors duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
          collapsed ? "justify-center px-0" : "justify-start gap-3",
          active
            ? "border-inkband/20 bg-inkband text-white hover:bg-inkband/80 hover:text-white"
            : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-sidebar-accent hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-0 h-5 w-0.75 -translate-y-1/2 rounded-full bg-accent",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center transition-colors duration-150",
            active ? "text-accent" : "text-muted-foreground group-hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {!collapsed && <span className="truncate">{route.name}</span>}
        {!collapsed && active && (
          <span className="ml-auto size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        )}
      </Link>
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
      <nav
        className="no-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-3"
        aria-label="Primary"
      >
        {!collapsed ? (
          <p className="flex items-center gap-2 px-2 pb-1.5 text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
            Menu
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </p>
        ) : (
          <p className="pb-1 text-center text-[10px] font-bold tracking-widest text-muted-foreground">
            ...
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
