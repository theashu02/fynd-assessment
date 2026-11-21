"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { PageHeader, TableSkeleton } from "@/components/common";
import { useOrders, type OrderSummaryRow } from "@/lib";
import { OrdersToolbar, type StatusFilter } from "./orders-toolbar";
import { OrdersTable } from "./orders-table";

function parseStatus(raw: string | null): StatusFilter {
  if (
    raw === "PLACED" ||
    raw === "PACKED" ||
    raw === "SHIPPED" ||
    raw === "CANCELLED"
  )
    return raw;
  return "ALL";
}

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function OrdersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("ref") ?? "",
  );
  const [status, setStatus] = useState<StatusFilter>(() =>
    parseStatus(searchParams.get("status")),
  );

  const debouncedRef = useDebouncedValue(searchInput, 300);
  const trimmedRef = debouncedRef.trim();

  useEffect(() => {
    const params = new URLSearchParams();
    if (trimmedRef) params.set("ref", trimmedRef);
    if (status !== "ALL") params.set("status", status);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [trimmedRef, status, pathname, router]);

  const listQuery = useOrders({
    ref: trimmedRef || undefined,
    status: status === "ALL" ? undefined : status,
  });
  const countsQuery = useOrders({ ref: trimmedRef || undefined });

  const counts = useMemo<Record<StatusFilter, number>>(() => {
    const rows = countsQuery.data ?? [];
    const next: Record<StatusFilter, number> = {
      ALL: rows.length,
      PLACED: 0,
      PACKED: 0,
      SHIPPED: 0,
      CANCELLED: 0,
    };
    for (const row of rows) next[row.status] += 1;
    return next;
  }, [countsQuery.data]);

  const rows = listQuery.data ?? [];
  const hasFilters = trimmedRef !== "" || status !== "ALL";

  function clearFilters() {
    setSearchInput("");
    setStatus("ALL");
  }

  function openOrder(row: OrderSummaryRow) {
    router.push(`/orders/${row.reference}`);
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Search by reference, filter by status, open details."
        action={
          <Button asChild>
            <Link href="/orders/new">New order</Link>
          </Button>
        }
      />
      <OrdersToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={setStatus}
        counts={counts}
      />
      <OrdersTable
        rows={rows}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        onRetry={() => listQuery.refetch()}
        isFetching={listQuery.isFetching}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
        onOpen={openOrder}
      />
    </div>
  );
}

export function OrdersView() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <OrdersContent />
    </Suspense>
  );
}

