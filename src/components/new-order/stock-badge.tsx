const IN_STOCK = "#0F766E";
const LOW_STOCK = "#F97316";
const OUT_OF_STOCK = "#DC2626";

export function stockState(stock: number): "out" | "low" | "in" {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "in";
}

export function StockBadge({ stock }: { stock: number }) {
  const state = stockState(stock);
  const style =
    state === "out"
      ? { backgroundColor: OUT_OF_STOCK, color: "#FFFFFF" }
      : state === "low"
        ? { backgroundColor: LOW_STOCK, color: "#0F172A" }
        : { backgroundColor: IN_STOCK, color: "#FFFFFF" };
  const label =
    state === "out"
      ? "Out of stock"
      : state === "low"
        ? `Low stock - ${stock} left`
        : `In stock - ${stock}`;
  return (
    <span
      className="inline-flex h-5 w-fit items-center rounded-md px-2 text-xs font-medium"
      style={style}
    >
      {label}
    </span>
  );
}

