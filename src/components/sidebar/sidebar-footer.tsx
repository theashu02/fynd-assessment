"use client";

import Link from "next/link";
import { Headset, Package } from "lucide-react";
import { cn } from "cn";
import { SidebarTip } from "./sidebar-tip";

type SidebarFooterProps = {
  collapsed: boolean;
};

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  return (
    <div className="border-t border-border p-3">
      {collapsed ? (
        <SidebarTip label="Store support" collapsed={collapsed}>
          <span className="flex h-10 w-full items-center justify-center text-muted-foreground">
            <Headset className="h-5 w-5" aria-hidden="true" />
          </span>
        </SidebarTip>
      ) : (
        <div className="border border-border bg-mist p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Headset className="h-3.5 w-3.5" aria-hidden="true" />
            Store support
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Taking a phone order? Check stock first, then build the cart.
          </p>
          <Link
            href="/products"
            className="mt-2 flex h-10 items-center justify-center gap-2 bg-inkband px-3 text-xs font-bold text-white hover:bg-inkband"
          >
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            Check live stock
          </Link>
        </div>
      )}
      <p className={cn("pt-3 text-center text-[11px] text-muted-foreground", collapsed && "hidden md:block")}>
        {collapsed ? "v1" : "Staff phone-order console"}
      </p>
    </div>
  );
}
