const TEAL = "#0F766E";
const ORANGE = "#F97316";
const RED = "#DC2626";

export function stockFill(stock: number): string {
  if (stock <= 0) return RED;
  if (stock <= 5) return ORANGE;
  return TEAL;
}

export function StockBar({ stock, max }: { stock: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (stock / max) * 100) : 0;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className="h-2 min-w-20 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={stock}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Stock level ${stock} of ${max}`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: stockFill(stock),
            minWidth: stock > 0 ? 4 : 0,
          }}
        />
      </div>
      <span
        className="w-8 shrink-0 text-right text-xs font-semibold text-foreground"
        style={stock <= 0 ? { color: RED } : undefined}
      >
        {stock}
      </span>
    </div>
  );
}

