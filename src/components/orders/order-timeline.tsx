import { Check, Package, ShoppingBag, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus = "PLACED" | "PACKED" | "SHIPPED" | "CANCELLED";

const STEPS = [
  { key: "PLACED", label: "Placed", icon: ShoppingBag },
  { key: "PACKED", label: "Packed", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
] as const;

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-6 text-center shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:size-14">
          <XCircle className="size-6 sm:size-7" aria-hidden />
        </span>
        <div>
          <p className="text-base font-semibold text-destructive sm:text-lg">
            Order cancelled
          </p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground sm:text-sm">
            This order was cancelled and stock was restored.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const progress = (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
      <div className="relative">
        <div className="absolute left-5 right-5 top-5 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div
            className="h-full rounded-full bg-gradient-to-r from-success to-info transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ol className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const done = index < currentIndex;
            const current = index === currentIndex;
            const Icon = step.icon;
            return (
              <li
                key={step.key}
                className="flex min-w-0 flex-col items-center gap-2 text-center"
                aria-current={current ? "step" : undefined}
              >
                <span
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    done && "border-success bg-success text-success-foreground shadow-md shadow-success/25",
                    current && "border-info bg-info text-info-foreground shadow-lg shadow-info/30 ring-4 ring-info/15",
                    !done && !current && "border-border bg-card text-muted-foreground shadow-sm",
                  )}
                  aria-hidden
                >
                  {current && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-info/30" />
                  )}
                  {done ? <Check className="size-5" strokeWidth={3} /> : <Icon className="relative size-[18px]" />}
                </span>
                <div className="leading-tight">
                  <p className={cn("text-sm font-medium", done || current ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </p>
                  <p
                    className={cn(
                      "mt-1 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                      done && "bg-success/10 text-success",
                      current && "bg-info/10 text-info",
                      !done && !current && "text-muted-foreground/70",
                    )}
                  >
                    {done ? "Done" : current ? "In progress" : "Pending"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
