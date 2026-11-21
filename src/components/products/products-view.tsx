"use client";

import { useMemo } from "react";
import { Package, RefreshCw, AlertCircle, TrendingDown, BarChart3 } from "lucide-react";
import { toast } from "@/components/ui/toast-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "@/components/page-header";
import { formatCents } from "@/lib/format";
import { useProducts } from "@/lib/products";
import { StockBadge } from "@/components/new-order/stock-badge";
import { StockBar } from "./stock-bar";

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: string;
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-1">
      <Icon className={`size-8 shrink-0 ${tone}`} aria-hidden />
      <span className="min-w-0">
        <span className="block text-xl font-bold tabular-nums text-foreground">
          {value}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {label}
        </span>
      </span>
    </div>
  );
}

export function ProductsView() {
  const productsQuery = useProducts({ refetchIntervalMs: 15_000 });
  const products = useMemo(
    () => productsQuery.data ?? [],
    [productsQuery.data],
  );

  const totalProducts = products.length;
  const outCount = products.filter((p) => p.stock <= 0).length;
  const lowCount = products.filter(
    (p) => p.stock >= 1 && p.stock <= 5,
  ).length;
  const scaleMax = Math.max(
    10,
    ...products.map((p) => p.stock),
  );

  const updatedAt = productsQuery.dataUpdatedAt
    ? new Date(productsQuery.dataUpdatedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  async function handleRefresh() {
    const result = await productsQuery.refetch();
    if (result.isError) toast.error("Refresh failed. Showing last known stock.");
  }

  if (productsQuery.isLoading) {
    return (
      <div>
        <PageHeader
          title="Catalogue"
          subtitle="Live stock levels. Auto-refreshes every 15 seconds."
        />
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] w-full" />
          ))}
        </div>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (productsQuery.isError) {
    return (
      <div>
        <PageHeader
          title="Catalogue"
          subtitle="Live stock levels. Auto-refreshes every 15 seconds."
        />
        <Card className="border-border bg-card shadow-none">
          <CardContent className="flex flex-col items-start gap-3 p-4">
            <p className="text-sm text-foreground">Failed to load products.</p>
            <Button variant="outline" onClick={handleRefresh}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Catalogue"
        subtitle="Live stock levels. Auto-refreshes every 15 seconds."
        action={
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={productsQuery.isFetching}
          >
            <RefreshCw
              className={`size-4 ${productsQuery.isFetching ? "animate-spin" : ""}`}
              aria-hidden
            />
            Refresh
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Products"
          value={totalProducts}
          icon={BarChart3}
          tone="text-info"
        />
        <StatCard
          label="Out of Stock"
          value={outCount}
          icon={AlertCircle}
          tone="text-destructive"
        />
        <StatCard
          label="Low Stock"
          value={lowCount}
          icon={TrendingDown}
          tone="text-ember"
        />
      </div>

      {updatedAt ? (
        <p className="mb-3 text-xs text-muted-foreground">
          Last updated {updatedAt}
          {productsQuery.isFetching ? " — refreshing..." : ""}
        </p>
      ) : null}

      {products.length === 0 ? (
        <Card className="border-border bg-card shadow-none">
          <CardContent className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-md bg-muted">
              <Package className="size-6 text-muted-foreground" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-foreground">
              No products found
            </p>
            <p className="max-w-55 text-xs text-muted-foreground">
              Products will appear here once the catalogue is seeded.
            </p>
            <Button variant="outline" onClick={handleRefresh}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden border-border bg-card shadow-none [overflow:visible] md:block">
            <CardHeader>
              <CardTitle>All products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-45">Stock level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatCents(p.priceCents)}</TableCell>
                      <TableCell>
                        <StockBar stock={p.stock} max={scaleMax} />
                      </TableCell>
                      <TableCell>
                        <StockBadge stock={p.stock} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-3 md:hidden">
            {products.map((p) => (
              <Card
                key={p.id}
                className="border-border bg-card shadow-none"
              >
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.sku}</p>
                    </div>
                    <StockBadge stock={p.stock} />
                  </div>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {formatCents(p.priceCents)}
                  </p>
                  <StockBar stock={p.stock} max={scaleMax} />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
