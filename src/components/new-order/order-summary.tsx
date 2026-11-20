import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";
import type { ProductDto } from "@/lib/products";

type Product = ProductDto[number];

export type SummaryLine = {
  product: Product;
  qty: number;
};

export type FailedLine = {
  productId: string;
  requested: number;
  available: number;
  name: string;
};

export function OrderSummary({
  lines,
  totalCents,
  count,
  isPending,
  stockError,
  failedLines,
  onIncrement,
  onDecrement,
  onRemove,
  onPlaceOrder,
}: {
  lines: SummaryLine[];
  totalCents: number;
  count: number;
  isPending: boolean;
  stockError: string | null;
  failedLines: FailedLine[];
  onIncrement: (p: Product) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onPlaceOrder: () => void;
}) {
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
        <ShoppingCart className="size-12 text-muted-foreground" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Cart is empty</p>
        <p className="max-w-55 text-xs text-muted-foreground">
          Add products from the catalogue. Stock is checked again on the server.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {stockError ? (
        <div
          role="alert"
          className="border px-3 py-2 text-xs"
          style={{ borderColor: "#DC2626", backgroundColor: "#DC2626", color: "#FFFFFF" }}
        >
          <p className="font-semibold">{stockError}</p>
          {failedLines.length > 0 ? (
            <ul className="mt-1 list-disc pl-4">
              {failedLines.map((d) => (
                <li key={d.productId}>
                  {d.name}: requested {d.requested}, available {d.available}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <ul className="flex flex-col divide-y divide-border">
        {lines.map(({ product, qty }) => (
          <li key={product.id} className="flex items-center gap-2 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCents(product.priceCents)} each
              </p>
              <div className="mt-1 flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onDecrement(product.id)}
                  aria-label={`Decrease ${product.name}`}
                >
                  <Minus className="size-3" aria-hidden />
                </Button>
                <span className="w-6 text-center text-xs font-semibold">{qty}</span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onIncrement(product)}
                  disabled={qty >= product.stock}
                  aria-label={`Increase ${product.name}`}
                >
                  <Plus className="size-3" aria-hidden />
                </Button>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-sm font-semibold text-foreground">
                {formatCents(product.priceCents * qty)}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemove(product.id)}
                aria-label={`Remove ${product.name}`}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">
          {count} item{count === 1 ? "" : "s"}
        </span>
        <span className="text-base font-bold text-foreground">
          {formatCents(totalCents)}
        </span>
      </div>
      <Button onClick={onPlaceOrder} disabled={isPending || lines.length === 0} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Placing order...
          </>
        ) : (
          "Place order"
        )}
      </Button>
    </div>
  );
}

