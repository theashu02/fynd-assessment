"use client";

export function MobileActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-6 lg:hidden">
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
