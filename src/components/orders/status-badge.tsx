import { cn } from "cn";
import type { OrderStatus } from "@/lib/orders";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PLACED: "bg-status-placed text-white",
  PACKED: "bg-status-packed text-white",
  SHIPPED: "bg-status-shipped text-white",
  CANCELLED: "bg-status-cancelled text-white",
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
        "inline-flex h-5 w-fit items-center rounded-md px-2 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
