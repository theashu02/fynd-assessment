import { Suspense } from "react";
import Link from "next/link";
import { Package2, Truck } from "lucide-react";
import { AppSidebar, MobileSidebar } from "./sidebar/app-sidebar";

function PromoBand() {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 bg-inkband px-4 py-1.5 text-center">
      <Truck className="size-3.5 shrink-0 text-white" aria-hidden />
      <p className="truncate text-[11px] font-semibold tracking-widest text-white uppercase">
        Phone orders close at 9 PM — stock updates live
      </p>
    </div>
  );
}

function MobileBrandBar() {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-4 py-2.5 md:hidden">
      <Suspense>
        <MobileSidebar />
      </Suspense>
      <Link href="/orders/new" className="flex min-w-0 flex-1 items-center justify-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-white">
          <Package2 className="size-4" aria-hidden />
        </span>
        <span className="truncate text-base font-bold tracking-tight">OrderConsole</span>
      </Link>
      <span className="w-8 shrink-0" aria-hidden="true" />
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Suspense>
        <AppSidebar />
      </Suspense>
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <PromoBand />
        <MobileBrandBar />
        <main className="no-scrollbar mx-auto w-full max-w-7xl flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
