import { Check, Package, ShoppingBag, Truck, XCircle } from "lucide-react";
import { cn } from "cn";
import type { OrderStatus } from "@/lib";

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
        className="flex flex-col items-center gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-6 text-center shadow-sm sm:p-8"
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

  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
      <ol className="flex gap-3 sm:gap-4">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          const Icon = step.icon;
          return (
            <li
              key={step.key}
              className="min-w-0 flex-1"
              aria-current={current ? "step" : undefined}
            >
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  done && "bg-success",
                  current && "bg-info",
                  !done && !current && "bg-muted",
                )}
                aria-hidden
              />
              <div className="mt-2.5 flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150",
                    done && "bg-success text-success-foreground",
                    current && "bg-info text-info-foreground ring-4 ring-info/15",
                    !done && !current && "bg-muted text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {done ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </span>
                <div className="min-w-0 leading-tight">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      done || current ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs font-medium",
                      done && "text-success",
                      current && "text-info",
                      !done && !current && "text-muted-foreground/70",
                    )}
                  >
                    {done ? "Done" : current ? "In progress" : "Pending"}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
