"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { EmptyState, TableSkeleton } from "@/components/common";
import { formatCents, type OrderSummaryRow } from "@/lib";
import { StatusBadge } from "./status-badge";

function formatDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function orderHref(row: OrderSummaryRow): string {
  return `/orders/${row.reference}`;
}

function activateOnKey(
  e: React.KeyboardEvent,
  open: () => void,
) {
  const target = e.target as HTMLElement | null;
  if (target && target.closest("a,button")) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    open();
  }
}

const ROW_FOCUS =
  "cursor-pointer transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

export function OrdersTable({
  rows,
  isLoading,
  isError,
  onRetry,
  isFetching,
  hasFilters,
  onClearFilters,
  onOpen,
}: {
  rows: OrderSummaryRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  isFetching: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
  onOpen: (row: OrderSummaryRow) => void;
}) {
  if (isLoading) return <TableSkeleton rows={6} />;

  if (isError) {
    return (
      <Card className="border-border bg-card shadow-none">
        <CardContent className="flex flex-col items-start gap-3 p-4">
          <p className="text-sm text-foreground">Failed to load orders.</p>
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No orders found"
        description={
          hasFilters
            ? "Try a different reference or status filter."
            : "Create your first order from New Order."
        }
        action={
          hasFilters ? (
            <Button variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button asChild>
              <Link href="/orders/new">New order</Link>
            </Button>
          )
        }
      />
    );
  }

  return (
    <div aria-busy={isFetching} className={isFetching ? "opacity-70" : undefined}>
      <Card className="hidden border-border bg-card shadow-none [overflow:visible] md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                role="link"
                tabIndex={0}
                aria-label={`Open order ${row.reference}`}
                onClick={() => onOpen(row)}
                onKeyDown={(e) => activateOnKey(e, () => onOpen(row))}
                className={ROW_FOCUS}
              >
                <TableCell className="font-medium">{row.reference}</TableCell>
                <TableCell>{formatDate(row.createdAt)}</TableCell>
                <TableCell className="text-right tabular-nums">{row.itemCount}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{formatCents(row.totalCents)}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={orderHref(row)}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <Card
            key={row.id}
            role="link"
            tabIndex={0}
            aria-label={`Open order ${row.reference}`}
            onClick={() => onOpen(row)}
            onKeyDown={(e) => activateOnKey(e, () => onOpen(row))}
            className="cursor-pointer border-border bg-card shadow-none transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          >
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {row.reference}
                </p>
                <StatusBadge status={row.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDate(row.createdAt)}</span>
                <span>
                  {row.itemCount} item{row.itemCount === 1 ? "" : "s"}
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {formatCents(row.totalCents)}
                </span>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Link href={orderHref(row)}>View</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

