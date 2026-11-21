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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const low = !out && product.stock <= 5;
  const atMax = qty >= product.stock;
  return (
    <Card className="group relative flex flex-col gap-0 overflow-hidden rounded-2xl border border-transparent bg-card py-0 shadow-none ring-0 transition-all duration-300 ease-out hover:z-10 hover:scale-[1.03] hover:border-border motion-reduce:transition-none motion-reduce:hover:scale-100">
      {/* Image */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-mist">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className={cn(
              "object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none",
              out && "opacity-70 grayscale",
            )}
          />
        ) : (
          <span className="flex h-full items-center justify-center">
            <Package className="size-10 text-muted-foreground" aria-hidden />
          </span>
        )}
        {/* Soft wash on hover for legibility */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F172A]/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:transition-none"
          aria-hidden
        />
        <span className="absolute left-4 top-4">
          <StockBadge stock={product.stock} />
        </span>
        {qty > 0 ? (
          <span className="absolute right-4 top-4 rounded-md bg-inkband px-2 py-1 text-[11px] font-bold text-white">
            {qty} in cart
          </span>
        ) : null}
        {/* Arrow quick-add, slides in on hover */}
        <button
          type="button"
          onClick={qty === 0 ? onAdd : onIncrement}
          disabled={out || atMax}
          aria-label={qty === 0 ? `Add ${product.name} to order` : `Add one more ${product.name}`}
          className="absolute bottom-4 right-4 flex size-11 translate-y-2 items-center justify-center rounded-full bg-white text-foreground opacity-0 shadow-lg transition-all duration-300 ease-out hover:bg-inkband hover:text-white focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0 motion-reduce:transition-none"
        >
          <ArrowUpRight className="size-5" aria-hidden />
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1.5 p-5 pb-4 sm:p-6 sm:pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {product.sku}
          </p>
          <RatingRow />
        </div>
        <h3 className="truncate text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <p className="text-xl font-bold tracking-tight text-foreground">
            {formatCents(product.priceCents)}
          </p>
          <p
            className={cn(
              "text-[11px] font-medium",
              out && "text-muted-foreground",
              low && "font-semibold text-[#EA580C]",
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
            className="w-full disabled:opacity-100"
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
                className="w-8 text-center text-sm font-bold"
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
