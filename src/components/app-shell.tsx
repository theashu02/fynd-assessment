"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Menu, Package, Package2, SquarePen } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
const NAV = [
  { href: "/orders/new", label: "New Order", icon: SquarePen },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/products", label: "Catalogue", icon: Package },
];
function isActive(pathname: string, href: string) {
  if (href === "/orders/new") return pathname === href;
  if (href === "/orders") return pathname === "/orders" || pathname.startsWith("/orders/");
  return pathname === href || pathname.startsWith(href + "/");
}
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Console" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 px-3 py-2 text-sm font-medium", active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
function Brand() {
  return (
    <Link href="/orders/new" className="flex items-center gap-2 px-3 py-4">
      <span className="flex size-8 items-center justify-center bg-accent text-accent-foreground">
        <Package2 className="size-4" aria-hidden />
      </span>
      <span className="text-base font-bold tracking-tight text-sidebar-foreground">OrderConsole</span>
    </Link>
  );
}
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="sticky top-0 flex h-screen flex-col">
          <Brand />
          <div className="px-2">
            <Suspense><NavLinks /></Suspense>
          </div>
          <p className="mt-auto px-5 py-4 text-xs text-sidebar-foreground/60">Staff phone-order console</p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-sidebar px-4 py-3 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar text-sidebar-foreground">
              <SheetHeader className="text-left">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
              </SheetHeader>
              <Brand />
              <Suspense><NavLinks onNavigate={() => setOpen(false)} /></Suspense>
            </SheetContent>
          </Sheet>
          <span className="text-base font-bold tracking-tight text-sidebar-foreground">OrderConsole</span>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
