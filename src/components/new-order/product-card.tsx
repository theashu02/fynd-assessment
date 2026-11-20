import { Minus, Package, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCents } from "@/lib/format";
import type { ProductDto } from "@/lib/products";
import { StockBadge } from "./stock-badge";

type Product = ProductDto[number];

function RatingRow() {
  return (
    <span className="flex items-center gap-1" aria-label="Rated 4.5 out of 5">
      <Star className="size-3.5 fill-warning text-warning" aria-hidden />
      <Star className="size-3.5 fill-warning text-warning" aria-hidden />
      <Star className="size-3.5 fill-warning text-warning" aria-hidden />
      <Star className="size-3.5 fill-warning text-warning" aria-hidden />
      <Star className="size-3.5 text-border" aria-hidden />
      <span className="text-[11px] font-medium text-muted-foreground">4.5</span>
    </span>
  );
}

export function ProductCard({
  product,
  qty,
  onAdd,
  onIncrement,
  onDecrement,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const out = product.stock <= 0;
  const low = product.stock >= 1 && product.stock <= 5;
  const atMax = qty >= product.stock;
  return (
    <Card className="cv-auto border-border bg-card shadow-none transition-colors hover:border-primary">
      <div className="relative flex h-28 items-center justify-center border-b border-border bg-mist">
        <Package className="size-10 text-muted-foreground" aria-hidden />
        <span className="absolute left-2 top-2">
          <StockBadge stock={product.stock} />
        </span>
        {low ? (
          <span className="absolute right-2 top-2 bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Low stock
          </span>
        ) : null}
      </div>
      <CardContent className="flex flex-col gap-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{product.sku}</p>
        <p className="truncate text-sm font-bold text-foreground">{product.name}</p>
        <RatingRow />
        <p className="line-clamp-2 min-h-8 text-xs leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold tracking-tight text-foreground">
            {formatCents(product.priceCents)}
          </p>
          <p className="text-[11px] font-medium text-muted-foreground">
            {out ? "No stock" : product.stock + " in stock"}
          </p>
        </div>
        {qty === 0 ? (
          <Button
            onClick={onAdd}
            disabled={out}
            className="mt-1 w-full border-destructive bg-destructive text-white hover:bg-destructive hover:text-white disabled:opacity-100"
            variant="outline"
          >
            {out ? "Out of stock" : "Add to order"}
          </Button>
        ) : (
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onDecrement}
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" aria-hidden />
              </Button>
              <span
                className="w-8 text-center text-sm font-bold"
                aria-live="polite"
              >
                {qty}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onIncrement}
                disabled={atMax}
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" aria-hidden />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              {atMax ? "Max reached" : product.stock + " avail"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

