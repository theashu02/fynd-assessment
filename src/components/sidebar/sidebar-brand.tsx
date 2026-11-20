"use client";

import Link from "next/link";
import { ChevronsLeft, ChevronsRight, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTip } from "./sidebar-tip";

type SidebarBrandProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function SidebarBrand({ collapsed, onToggle }: SidebarBrandProps) {
  if (collapsed) {
    return (
      <div className="flex shrink-0 flex-col items-center gap-2 px-2 pt-3 pb-1">
        <Link
          href="/orders/new"
          aria-label="OrderConsole home"
          className="flex size-9 items-center justify-center bg-inkband text-white transition-colors hover:bg-inkband/90"
        >
          <Package2 className="size-4" aria-hidden="true" />
        </Link>
        <SidebarTip label="Expand" collapsed>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="size-7 border border-border bg-card text-foreground hover:border-inkband hover:bg-inkband hover:text-white"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </SidebarTip>
      </div>
    );
  }

  return (
    <div className="flex h-14 shrink-0 items-center gap-2 px-2">
      <Link href="/orders/new" className="flex min-w-0 flex-1 items-center gap-2">
        <span className="relative flex size-8 shrink-0 items-center justify-center bg-inkband text-white">
          <Package2 className="size-4" aria-hidden="true" />
          <span
            className="absolute -right-0.5 -bottom-0.5 size-2 border-2 border-background bg-accent"
            aria-hidden="true"
          />
        </span>
        <span className="flex min-w-0 flex-col leading-none">
          <span className="truncate text-sm font-bold tracking-widest text-foreground uppercase">
            OrderConsole
          </span>
          <span className="mt-0.5 truncate text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Phone orders
          </span>
        </span>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-label="Collapse sidebar"
        className="size-7 shrink-0 border border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
      >
        <ChevronsLeft className="size-4" />
      </Button>
    </div>
  );
}
