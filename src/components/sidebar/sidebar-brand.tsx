"use client";

import Link from "next/link";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { SidebarTip } from "./sidebar-tip";

type SidebarBrandProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function SidebarBrand({ collapsed, onToggle }: SidebarBrandProps) {
  return (
    <div
      className={cn(
        "flex h-16 items-center gap-2 border-b border-border px-4",
        collapsed && "md:justify-center md:px-2",
      )}
    >
      {!collapsed && (
        <Link href="/orders/new" className="flex min-w-0 items-center gap-2">
          <span className="h-3 w-3 shrink-0 bg-accent" aria-hidden="true" />
          <span className="truncate text-xl font-bold tracking-widest text-foreground uppercase">
            OrderConsole
          </span>
        </Link>
      )}
      <SidebarTip label={collapsed ? "Expand" : "Collapse"} collapsed={collapsed}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "hidden shrink-0 text-muted-foreground md:inline-flex",
            !collapsed && "ml-auto",
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5" />
          ) : (
            <ChevronsLeft className="h-5 w-5" />
          )}
        </Button>
      </SidebarTip>
    </div>
  );
}
