"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui";
import { PackageSearch, RotateCcw, Search } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
} from "@/components/ui";
import { EmptyState, PageHeader } from "@/components/common";
import {
  formatCents,
  usePlaceOrder,
  useProducts,
  type PlaceOrderError,
} from "@/lib";
import { cartCount, useCartStore } from "@/stores";
import {
  OrderSummary,
  ProductCard,
  type FailedLine,
} from "@/components/new-order";
import { cn } from "cn";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "in", label: "In stock" },
  { id: "low", label: "Low stock" },
  { id: "out", label: "Out of stock" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const PRODUCT_GRID =
  "product-grid grid grid-cols-1 gap-6 p-1 sm:grid-cols-2 sm:p-2 lg:grid-cols-1 lg:gap-8 xl:grid-cols-2 2xl:grid-cols-3";

export default function NewOrderPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
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
    let rows = products;
    if (q) {
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    }
    if (filter === "in") rows = rows.filter((p) => p.stock > 5);
    if (filter === "low") rows = rows.filter((p) => p.stock >= 1 && p.stock <= 5);
    if (filter === "out") rows = rows.filter((p) => p.stock <= 0);
    return rows;
  }, [products, query, filter]);

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
        toast.success("Order " + order.reference + " placed");
        router.push("/orders/" + order.reference);
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
              ? "Not enough stock for: " + names
              : (e.message ?? "Insufficient stock"),
          );
          productsQuery.refetch();
        } else {
          toast.error(e.message ?? "Failed to place order");
        }
      },
    });
  }

  function clearSearchAndFilters() {
    setQuery("");
    setFilter("all");
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
        title="New orders"
        subtitle="Search the catalogue and build the order. Stock is checked live."
        action={
          <Button
            variant="outline"
            onClick={() => productsQuery.refetch()}
            disabled={productsQuery.isFetching}
          >
            <RotateCcw
              className={cn("size-4", productsQuery.isFetching && "animate-spin")}
              aria-hidden
            />
            Refresh
          </Button>
        }
      />

      {productsQuery.isLoading ? (
        <div className={PRODUCT_GRID}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-120 w-full rounded-2xl" />
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
            <div className="relative mb-3">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products by name"
                aria-label="Search catalogue"
                className="h-10 bg-card pl-9 text-[15px]!"
              />
            </div>
            <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Stock filter">
              {FILTERS.map((f) => (
                <Button
                  key={f.id}
                  role="tab"
                  aria-selected={filter === f.id}
                  variant={filter === f.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.id)}
                  className={cn(filter !== f.id && "bg-card")}
                >
                  {f.label}
                </Button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="No products found"
                description={
                  query.trim()
                    ? "No products match your search."
                    : "No products in this view yet."
                }
                action={
                  query.trim() || filter !== "all" ? (
                    <Button variant="outline" onClick={clearSearchAndFilters}>
                      Clear search &amp; filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className={PRODUCT_GRID}>
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
            <div className="sticky top-6">{summary}</div>
          </div>
        </div>
      )}
      {lines.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-4 py-3 lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground tabular-nums">
                {formatCents(totalCents)}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {count} items in cart
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
