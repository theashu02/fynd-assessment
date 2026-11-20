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
  iconBg: string;
  iconColor: string;
};

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3">
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-sm"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="size-3.5" style={{ color: iconColor }} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium leading-none text-muted-foreground mb-0.5">{label}</p>
        <p className="text-base font-bold leading-none text-foreground">{value}</p>
      </div>
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
        <div className="mb-4 flex flex-wrap items-center divide-x divide-border bg-card">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-40 border-0" />
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

      <div className="mb-4 flex flex-wrap items-center divide-x divide-border border-0 bg-card outline-none">
        <StatCard
          label="Total Products"
          value={totalProducts}
          icon={BarChart3}
          iconBg="#EFF6FF"
          iconColor="#1D4ED8"
        />
        <StatCard
          label="Out of Stock"
          value={outCount}
          icon={AlertCircle}
          iconBg="#FEF2F2"
          iconColor="#DC2626"
        />
        <StatCard
          label="Low Stock"
          value={lowCount}
          icon={TrendingDown}
          iconBg="#FFF7ED"
          iconColor="#EA580C"
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
            <span className="flex size-14 items-center justify-center bg-muted">
              <Package className="size-6 text-muted-foreground" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-foreground">
              No products found
            </p>
            <p className="max-w-55 text-xs text-muted-foreground">
              Products will appear here once the catalogue is seeded.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden border-border bg-card shadow-none md:block">
            <CardHeader>
              <CardTitle>All products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
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
                      <TableCell>{formatCents(p.priceCents)}</TableCell>
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
                  <p className="text-sm font-bold text-foreground">
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
