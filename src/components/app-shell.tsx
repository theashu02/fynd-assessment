import { Suspense } from "react";
import Link from "next/link";
import { Package2, Truck } from "lucide-react";
import { AppSidebar } from "./sidebar/app-sidebar";

function PromoBand() {
  return (
    <div className="flex items-center justify-center gap-2 bg-inkband py-1.5 pr-4 pl-14 text-center md:pl-4">
      <Truck className="size-3.5 shrink-0 text-white" aria-hidden />
      <p className="truncate text-[11px] font-semibold tracking-widest text-white uppercase">
        Phone orders close at 9 PM — stock updates live
      </p>
    </div>
  );
}

function MobileBrandBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-center border-b border-border bg-card px-4 py-2.5 md:hidden">
      <Link href="/orders/new" className="flex min-w-0 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center bg-primary text-white">
          <Package2 className="size-4" aria-hidden />
        </span>
        <span className="truncate text-base font-bold tracking-tight">OrderConsole</span>
      </Link>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Suspense>
        <AppSidebar />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <PromoBand />
        <MobileBrandBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
