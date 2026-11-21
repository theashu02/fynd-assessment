import { cn } from "cn";

export function stockState(stock: number): "out" | "low" | "in" {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "in";
}

const STATE_STYLES = {
  out: "bg-destructive text-destructive-foreground",
  low: "bg-accent text-accent-foreground",
  in: "bg-success text-success-foreground",
} as const;

export function StockBadge({ stock }: { stock: number }) {
  const state = stockState(stock);
  const label =
    state === "out"
      ? "Out of stock"
      : state === "low"
        ? `Low stock - ${stock} left`
        : `In stock - ${stock}`;
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center rounded-md px-2 text-xs font-medium",
        STATE_STYLES[state],
      )}
    >
      {label}
    </span>
  );
}
