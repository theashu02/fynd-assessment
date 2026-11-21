import { cn } from "cn";

export function stockFill(stock: number): string {
  if (stock <= 0) return "bg-destructive";
  if (stock <= 5) return "bg-accent";
  return "bg-success";
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
          className={cn("h-full rounded-full", stockFill(stock))}
          style={{
            width: `${pct}%`,
            minWidth: stock > 0 ? 4 : 0,
          }}
        />
      </div>
      <span
        className={cn(
          "w-8 shrink-0 text-right text-xs font-semibold tabular-nums",
          stock <= 0 ? "text-destructive" : "text-foreground",
        )}
      >
        {stock}
      </span>
    </div>
  );
}
