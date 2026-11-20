import { Check } from "lucide-react";
import { cn } from "cn";
import type { OrderStatus } from "@/lib/orders";

const STEPS: { key: Exclude<OrderStatus, "CANCELLED">; label: string }[] = [
  { key: "PLACED", label: "Placed" },
  { key: "PACKED", label: "Packed" },
  { key: "SHIPPED", label: "Shipped" },
];

const TEAL = "#0F766E";
const BLUE = "#1D4ED8";

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div
        role="status"
        className="px-4 py-5 text-center"
        style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
      >
        <p className="text-sm font-bold">Cancelled</p>
        <p className="mt-1 text-xs opacity-90">
          This order was cancelled and stock was restored.
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <ol className="flex flex-col">
      {STEPS.map((step, index) => {
        const isLast = index === STEPS.length - 1;
        const done = index < currentIndex;
        const current = index === currentIndex;
        const dotStyle = done
          ? { backgroundColor: TEAL, color: "#FFFFFF" }
          : current
            ? { backgroundColor: BLUE, color: "#FFFFFF" }
            : undefined;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full",
                  !done && !current && "bg-muted text-muted-foreground",
                )}
                style={dotStyle}
                aria-hidden
              >
                {done ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <span className="text-[11px] font-bold">{index + 1}</span>
                )}
              </span>
              {!isLast ? (
                <span
                  className="w-0.5 flex-1"
                  style={{ backgroundColor: done ? TEAL : "#CBD5E1" }}
                  aria-hidden
                />
              ) : null}
            </div>
            <div className={cn("pb-5", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm",
                  done || current
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {done ? "Completed" : current ? "Current step" : "Pending"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

