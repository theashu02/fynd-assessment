import Image from "next/image";
import {
  AlertCircle,
  Loader2,
  Lock,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
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

function LineThumbnail({ product }: { product: Product }) {
  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-mist">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
        />
      ) : (
        <Package className="size-4 text-muted-foreground" aria-hidden />
      )}
    </span>
  );
}

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
  const failedById = new Map(failedLines.map((line) => [line.productId, line]));

  if (lines.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBag className="size-6" aria-hidden />
          </div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            Your cart is empty
          </h3>
          <p className="mt-1.5 max-w-60 text-sm leading-relaxed text-muted-foreground">
            Add products from the catalogue to get started. Inventory is
            verified automatically at checkout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label="Order summary"
      className="flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Order summary
        </h2>
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground tabular-nums">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Stock Error Banner */}
      {stockError ? (
        <div className="px-5 pt-4">
          <div
            role="alert"
            className="flex gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold leading-snug">{stockError}</p>
              {failedLines.length > 0 ? (
                <ul className="list-disc space-y-0.5 pl-4 text-destructive/90">
                  {failedLines.map((d) => (
                    <li key={d.productId}>
                      <span className="font-medium">{d.name}</span>: requested{" "}
                      {d.requested}, only {d.available} left
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Line Items */}
      <ul className="max-h-[420px] divide-y divide-border overflow-y-auto px-5">
        {lines.map(({ product, qty }) => {
          const failed = failedById.get(product.id);
          const atMaxStock = qty >= product.stock;

          return (
            <li
              key={product.id}
              className="group flex items-start justify-between gap-3 py-4"
            >
              <LineThumbnail product={product} />
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="truncate text-sm font-medium leading-tight text-foreground">
                    {product.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                    <span>{formatCents(product.priceCents)} each</span>
                    {failed ? (
                      <span className="font-medium text-destructive">
                        · Only {failed.available} available
                      </span>
                    ) : atMaxStock ? (
                      <span className="font-medium text-ember">
                        · Max stock reached
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Segmented Quantity Stepper */}
                <div className="inline-flex items-center rounded-md border border-input bg-background shadow-xs">
                  <button
                    type="button"
                    onClick={() => onDecrement(product.id)}
                    disabled={isPending}
                    aria-label={`Decrease ${product.name}`}
                    className="flex size-7 items-center justify-center rounded-l-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Minus className="size-3" aria-hidden />
                  </button>
                  <span className="min-w-8 border-x border-input px-2 text-center text-xs font-medium text-foreground tabular-nums">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onIncrement(product)}
                    disabled={isPending || atMaxStock}
                    aria-label={`Increase ${product.name}`}
                    className="flex size-7 items-center justify-center rounded-r-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Plus className="size-3" aria-hidden />
                  </button>
                </div>
              </div>

              {/* Line Total & Remove */}
              <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {formatCents(product.priceCents * qty)}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(product.id)}
                  disabled={isPending}
                  aria-label={`Remove ${product.name}`}
                  className="text-muted-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Totals & CTA Footer */}
      <div className="space-y-4 border-t border-border bg-muted/30 px-5 py-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCents(totalCents)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2.5 text-base font-semibold text-foreground">
            <span>Total</span>
            <span className="tabular-nums">{formatCents(totalCents)}</span>
          </div>
        </div>

        <Button
          onClick={onPlaceOrder}
          disabled={isPending || lines.length === 0}
          className="h-10 w-full gap-2 font-medium shadow-xs"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Placing order...
            </>
          ) : (
            <>Place order · {formatCents(totalCents)}</>
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3" aria-hidden />
          Inventory is verified live when you place your order
        </p>
      </div>
    </section>
  );
}
