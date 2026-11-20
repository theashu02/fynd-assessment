"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { useProducts } from "@/lib/products";
import { formatCents } from "@/lib/format";
import { cartCount, useCartStore } from "@/stores/cart-store";
import { usePlaceOrder, type PlaceOrderError } from "@/lib/use-place-order";
import { OrderSummary, type FailedLine } from "@/components/new-order/order-summary";
import { ProductCard } from "@/components/new-order/product-card";

export default function NewOrderPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [failedLines, setFailedLines] = useState<FailedLine[]>([]);

  const items = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const productsQuery = useProducts();
  const placeOrder = usePlaceOrder();

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [products, query]);

  const lines = useMemo(() => {
    const out: { product: (typeof products)[number]; qty: number }[] = [];
    for (const [id, qty] of Object.entries(items)) {
      const product = byId.get(id);
      if (product) out.push({ product, qty });
    }
    return out.sort((a, b) => a.product.name.localeCompare(b.product.name));
  }, [items, byId]);

  const count = cartCount(items);
  const totalCents = lines.reduce((sum, l) => sum + l.product.priceCents * l.qty, 0);

  function handlePlaceOrder() {
    setStockError(null);
    setFailedLines([]);
    const payload = lines.map(({ product, qty }) => ({
      productId: product.id,
      quantity: qty,
    }));
    if (payload.length === 0) return;
    placeOrder.mutate(payload, {
      onSuccess: (order) => {
        clear();
        setSheetOpen(false);
        toast.success(`Order ${order.reference} placed`);
        router.push(`/orders/${order.reference}`);
      },
      onError: (err) => {
        const e = err as unknown as PlaceOrderError;
        if (e.status === 409 && e.code === "INSUFFICIENT_STOCK") {
          const failed: FailedLine[] = (e.details ?? []).map((d) => ({
            ...d,
            name: byId.get(d.productId)?.name ?? d.productId,
          }));
          setFailedLines(failed);
          const names = failed.map((f) => f.name).join(", ");
          setStockError(
            names
              ? `Not enough stock for: ${names}`
              : (e.message ?? "Insufficient stock"),
          );
          productsQuery.refetch();
        } else {
          toast.error(e.message ?? "Failed to place order");
        }
      },
    });
  }

  const summary = (
    <OrderSummary
      lines={lines}
      totalCents={totalCents}
      count={count}
      isPending={placeOrder.isPending}
      stockError={stockError}
      failedLines={failedLines}
      onIncrement={(p) => increment(p.id, p.stock)}
      onDecrement={decrement}
      onRemove={remove}
      onPlaceOrder={handlePlaceOrder}
    />
  );

  return (
    <div>
      <PageHeader
        title="New Order"
        subtitle="Take a phone order - pick products, confirm the total, submit."
      />
      {productsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : productsQuery.isError ? (
        <Card className="border-border bg-card shadow-none">
          <CardContent className="flex flex-col items-start gap-3 p-4">
            <p className="text-sm text-foreground">Failed to load catalogue.</p>
            <Button variant="outline" onClick={() => productsQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="relative mb-4">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or SKU"
                aria-label="Search catalogue"
                className="pl-9"
              />
            </div>
            {filtered.length === 0 ? (
              <Card className="border-border bg-card shadow-none">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  {query.trim() ? "No products match your search." : "No products in the catalogue yet."}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    qty={items[p.id] ?? 0}
                    onAdd={() => add(p.id, 1, p.stock)}
                    onIncrement={() => increment(p.id, p.stock)}
                    onDecrement={() => decrement(p.id)}
                  />
                ))}
              </div>
            )}
            <div className="h-20 lg:hidden" />
          </div>
          <div className="hidden lg:block">
            <Card className="sticky top-6 border-border bg-card shadow-none">
              <CardHeader>
                <CardTitle>Order summary</CardTitle>
              </CardHeader>
              <CardContent>{summary}</CardContent>
            </Card>
          </div>
        </div>
      )}
      {lines.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-4 py-3 lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {formatCents(totalCents)}
              </p>
              <p className="text-xs text-muted-foreground">
                {count} item{count === 1 ? "" : "s"} in cart
              </p>
            </div>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button className="flex-1">Review order</Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[85vh] overflow-y-auto border-border bg-card text-card-foreground"
              >
                <SheetHeader className="text-left">
                  <SheetTitle>Order summary</SheetTitle>
                </SheetHeader>
                <div className="mt-2 pb-4">{summary}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      ) : null}
    </div>
  );
}

