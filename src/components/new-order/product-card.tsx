import Image from "next/image";
import {
  ArrowUpRight,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { cn } from "cn";
import { Button, Card } from "@/components/ui";
import { StockBadge } from "@/components/common";
import { formatCents, type ProductDto } from "@/lib";

type Product = ProductDto[number];

function RatingRow() {
  return (
    <span className="flex items-center gap-1" aria-label="Rated 4.5 out of 5">
      <Star className="size-3.5 fill-warning text-warning" aria-hidden />
      <Star className="size-3.5 fill-warning text-warning" aria-hidden />
      <Star className="size-3.5 fill-warning text-warning" aria-hidden />
      <Star className="size-3.5 fill-warning text-warning" aria-hidden />
      <Star className="size-3.5 text-border" aria-hidden />
      <span className="text-xs font-medium text-muted-foreground">4.5</span>
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
  const low = !out && product.stock <= 5;
  const atMax = qty >= product.stock;
  return (
    <Card className="group relative flex flex-col gap-0 overflow-hidden rounded-2xl border border-transparent bg-card py-0 shadow-none ring-0 transition-[transform,border-color] duration-150 ease-out hover:z-10 hover:scale-[1.01] hover:border-border motion-reduce:transition-none motion-reduce:hover:scale-100">
      {/* Image */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-mist">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className={cn("object-cover", out && "opacity-70 grayscale")}
          />
        ) : (
          <span className="flex h-full items-center justify-center">
            <Package className="size-10 text-muted-foreground" aria-hidden />
          </span>
        )}
        <span className="absolute left-4 top-4">
          <StockBadge stock={product.stock} />
        </span>
        {qty > 0 ? (
          <span className="absolute right-4 top-4 rounded-md bg-inkband px-2 py-1 text-xs font-bold text-white tabular-nums">
            {qty} in cart
          </span>
        ) : null}
        {/* Quick-add */}
        <button
          type="button"
          onClick={qty === 0 ? onAdd : onIncrement}
          disabled={out || atMax}
          aria-label={qty === 0 ? `Add ${product.name} to order` : `Add one more ${product.name}`}
          className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-colors duration-150 hover:bg-inkband hover:text-white disabled:pointer-events-none disabled:opacity-0"
        >
          <ArrowUpRight className="size-5" aria-hidden />
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1.5 p-5 pb-4 sm:p-6 sm:pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {product.sku}
          </p>
          <RatingRow />
        </div>
        <h3 className="truncate text-base font-semibold tracking-tight text-foreground transition-colors duration-150 group-hover:text-primary">
          {product.name}
        </h3>
        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">
            {formatCents(product.priceCents)}
          </p>
          <p
            className={cn(
              "text-xs font-medium",
              out && "text-muted-foreground",
              low && "font-semibold text-ember",
              !out && !low && "text-muted-foreground",
            )}
          >
            {out
              ? "No stock"
              : low
                ? `Only ${product.stock} left`
                : `${product.stock} in stock`}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-2 border-t border-border/50 p-4 sm:px-6 sm:pb-5 sm:pt-4">
        {qty === 0 ? (
          <Button
            onClick={onAdd}
            disabled={out}
            className="w-full disabled:opacity-100 text-[14px]"
            variant={out ? "outline" : "default"}
            size="lg"
          >
            {out ? (
              "Out of stock"
            ) : (
              <>
                <ShoppingCart className="size-4" aria-hidden />
                Add to order
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 rounded-md border border-border p-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onDecrement}
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" aria-hidden />
              </Button>
              <span
                className="w-8 text-center text-sm font-bold tabular-nums"
                aria-live="polite"
              >
                {qty}
              </span>
              <Button
                variant="ghost"
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
      </div>
    </Card>
  );
}
