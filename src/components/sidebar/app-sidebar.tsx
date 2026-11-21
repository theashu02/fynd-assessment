"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav } from "./sidebar-nav";
import { SidebarFooter } from "./sidebar-footer";

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "hidden h-screen shrink-0 flex-col overflow-visible bg-background transition-[width] duration-150 ease-in-out md:flex border-r",
          isCollapsed ? "md:w-14" : "md:w-48",
        )}
      >
        <SidebarBrand
          collapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        <SidebarNav pathname={pathname} collapsed={isCollapsed} />
        <SidebarFooter collapsed={isCollapsed} />
      </aside>
    </TooltipProvider>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open menu"
          className="rounded-md bg-card shadow-sm md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-64 gap-0 border-border bg-background p-0 text-card-foreground duration-150 data-open:slide-in-from-left-4 data-closed:slide-out-to-left-4"
      >
        <SheetHeader className="sr-only text-left">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="flex h-full min-h-0 flex-col bg-background">
          <SidebarBrand
            collapsed={false}
            onToggle={() => setOpen(false)}
            action={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="size-7 shrink-0 border border-border bg-card text-foreground hover:border-inkband hover:bg-inkband hover:text-white"
              >
                <X className="size-4" />
              </Button>
            }
          />
          <SidebarNav pathname={pathname} collapsed={false} />
          <SidebarFooter collapsed={false} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
