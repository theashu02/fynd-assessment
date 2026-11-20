import { cn } from "cn";
import type { OrderStatus } from "@/lib/orders";

const STATUS_FILL: Record<OrderStatus, string> = {
  PLACED: "#1D4ED8",
  PACKED: "#0F766E",
  SHIPPED: "#4338CA",
  CANCELLED: "#DC2626",
};

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center px-2 text-xs font-medium",
        className,
      )}
      style={{ backgroundColor: STATUS_FILL[status], color: "#FFFFFF" }}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

