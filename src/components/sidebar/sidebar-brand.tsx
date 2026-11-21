"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronsLeft, ChevronsRight, Package2 } from "lucide-react";
import { Button } from "@/components/ui";
import { SidebarTip } from "./sidebar-tip";

type SidebarBrandProps = {
  collapsed: boolean;
  onToggle: () => void;
  action?: ReactNode;
};

export function SidebarBrand({ collapsed, onToggle, action }: SidebarBrandProps) {
  if (collapsed) {
    return (
      <div className="flex shrink-0 justify-center px-2 pt-3 pb-1">
        <SidebarTip label="Expand" collapsed>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="group relative size-9 shrink-0 bg-inkband text-white transition-colors hover:bg-inkband/90"
          >
            <Package2
              className="size-4 transition-[transform,opacity] duration-150 group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0"
              aria-hidden="true"
            />
            
            <ChevronsRight
              className="absolute size-4 scale-75 opacity-0 transition-[transform,opacity] duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            />
          </Button>
        </SidebarTip>
      </div>
    );
  }

  return (
    <div className="flex h-14 shrink-0 items-center gap-2 px-2">
      <Link href="/orders/new" className="flex min-w-0 flex-1 items-center gap-2">
        <span className="relative flex size-8 shrink-0 items-center justify-center rounded-md bg-inkband text-white">
          <Package2 className="size-4" aria-hidden="true" />
          <span
            className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-background bg-accent"
            aria-hidden="true"
          />
        </span>
        <span className="flex min-w-0 flex-col leading-none">
          <span className="truncate text-sm font-bold tracking-widest text-foreground uppercase">
            OrderConsole
          </span>
          <span className="mt-0.5 truncate text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            OrderFlow
          </span>
        </span>
      </Link>
      {action ?? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label="Collapse sidebar"
          className="size-7 shrink-0 border border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
        >
          <ChevronsLeft className="size-4" />
        </Button>
      )}
    </div>
  );
}