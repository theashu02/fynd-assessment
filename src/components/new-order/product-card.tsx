import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCents } from "@/lib/format";
import type { ProductDto } from "@/lib/products";
import { StockBadge } from "./stock-badge";

type Product = ProductDto[number];

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
  const atMax = qty >= product.stock;
  return (
    <Card
      className={`border-border bg-card shadow-none ${out ? "opacity-60" : ""}`}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {product.name}
            </p>
            <p className="text-xs text-muted-foreground">{product.sku}</p>
          </div>
          <StockBadge stock={product.stock} />
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {product.description}
        </p>
        <p className="text-sm font-bold text-foreground">
          {formatCents(product.priceCents)}
        </p>
        {qty === 0 ? (
          <Button
            onClick={onAdd}
            disabled={out}
            className="w-full"
            variant={out ? "outline" : "default"}
          >
            {out ? "Out of stock" : "Add"}
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onDecrement}
                aria-label={`Decrease ${product.name}`}
              >
                <Minus className="size-3.5" aria-hidden />
              </Button>
              <span
                className="w-8 text-center text-sm font-semibold"
                aria-live="polite"
              >
                {qty}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onIncrement}
                disabled={atMax}
                aria-label={`Increase ${product.name}`}
              >
                <Plus className="size-3.5" aria-hidden />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              {atMax ? `Max ${product.stock}` : `${product.stock} avail`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

