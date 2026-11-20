"use client";

import type { ReactElement } from "react";
import { cn } from "cn";

type SidebarTipProps = {
  label: string;
  collapsed: boolean;
  children: ReactElement;
};

export function SidebarTip({ label, collapsed, children }: SidebarTipProps) {
  if (!collapsed) return children;
  return (
    <span className="group/tip relative flex w-full">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2",
          "border border-border bg-inkband px-2 py-1 text-xs font-medium whitespace-nowrap text-white",
          "opacity-0 group-hover/tip:opacity-100",
        )}
      >
        {label}
      </span>
    </span>
  );
}
