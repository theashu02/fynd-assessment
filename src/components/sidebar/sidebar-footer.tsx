"use client";

import Link from "next/link";
import { Headset } from "lucide-react";
import { cn } from "cn";
import { SidebarTip } from "./sidebar-tip";

type SidebarFooterProps = {
  collapsed: boolean;
};

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  return (
    <div className="shrink-0 bg-background p-2">
      {collapsed ? (
        <div className="flex flex-col items-center gap-1.5">
          <SidebarTip label="Check live stock" collapsed={collapsed}>
            <Link
              href="/products"
              aria-label="Check live stock"
              className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-inkband hover:bg-inkband hover:text-white"
            >
              <Headset className="size-4" aria-hidden="true" />
            </Link>
          </SidebarTip>
          <p className="hidden text-[10px] text-muted-foreground md:block">
            v1
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card p-2.5">
          <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <span className="flex size-6 items-center justify-center rounded-md bg-inkband text-white">
              <Headset className="size-3.5" aria-hidden="true" />
            </span>
            Store support
            <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-status-packed">
              <span
                className="size-1.5 animate-pulse rounded-full bg-status-packed"
                aria-hidden="true"
              />
              LIVE
            </span>
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Taking a phone order? Check stock first, then build the cart.
          </p>
          <Link
            href="https://github.com/theashu02"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex h-9 items-center justify-center gap-2 overflow-hidden rounded-md border border-inkband bg-inkband px-3 text-sm font-medium tracking-wide whitespace-nowrap text-white transition-colors hover:border-inkband/90 hover:bg-inkband/90 hover:text-white"
          >
            <Headset className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Contact</span>
          </Link>
        </div>
      )}
      {!collapsed && (
        <p className={cn("pt-2 text-center text-[11px] text-muted-foreground")}>
          Staff phone-order console
        </p>
      )}
    </div>
  );
}
