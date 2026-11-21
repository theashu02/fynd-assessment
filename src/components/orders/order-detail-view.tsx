"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  DetailSkeleton,
  MobileActionBar,
  PageHeader,
} from "@/components/common";
import {
  formatCents,
  useOrder,
  useUpdateOrderStatus,
  type OrderApiError,
  type OrderStatus,
} from "@/lib";
import { OrderActions } from "./order-actions";
import { OrderTimeline } from "./order-timeline";
import { StatusBadge } from "./status-badge";

function formatDateTime(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function pastTense(status: OrderStatus): string {
  if (status === "PACKED") return "marked as packed";
  if (status === "SHIPPED") return "marked as shipped";
  return "cancelled";
}

export function OrderDetailView({ id }: { id: string }) {
  const router = useRouter();
  const orderQuery = useOrder(id);
  const updateStatus = useUpdateOrderStatus(id);
  const isPending = updateStatus.isPending;

  function handleStatus(next: OrderStatus) {
    updateStatus.mutate(next, {
      onSuccess: (order) => {
        toast.success(`Order ${order.reference} ${pastTense(next)}`);
        if (next === "CANCELLED") router.refresh();
      },
      onError: (err) => {
        const e = err as unknown as OrderApiError;
        toast.error(e.message ?? "Failed to update order");
      },
    });
  }

  if (orderQuery.isLoading) return <DetailSkeleton />;

  if (orderQuery.isError) {
    const err = orderQuery.error as unknown as OrderApiError;
    const notFound = err?.status === 404;
    return (
      <div>
        <PageHeader
          title={`Order ${id}`}
          subtitle="Order details and fulfilment."
          action={
            <Button asChild variant="outline">
              <Link href="/orders">Back to orders</Link>
            </Button>
          }
        />
        <Card className="border-border bg-card shadow-none">
          <CardContent className="flex flex-col items-start gap-3 p-4">
            <p className="text-sm font-semibold text-foreground">
              {notFound ? "Order not found." : "Failed to load order."}
            </p>
            <p className="text-xs text-muted-foreground">
              {notFound
                ? "Check the reference and try again."
                : (err?.message ?? "Something went wrong.")}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => orderQuery.refetch()}>
                Retry
              </Button>
              <Button asChild variant="ghost">
                <Link href="/orders">Back to orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = orderQuery.data;
  if (!order) return <DetailSkeleton />;
  const actions =
    order.status === "PLACED" || order.status === "PACKED" ? (
      <OrderActions
        status={order.status}
        isPending={isPending}
        onAdvance={handleStatus}
        onCancel={() => handleStatus("CANCELLED")}
      />
    ) : null;

  return (
    <div>
      <PageHeader
        title={order.reference}
        subtitle={`Created ${formatDateTime(order.createdAt)}`}
        action={
          <Button asChild variant="outline">
            <Link href="/orders">Back to orders</Link>
          </Button>
        }
      />
      <div className="mb-6">
        <StatusBadge status={order.status} className="h-7 px-3 text-sm" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="min-w-0 border-border bg-card shadow-none overflow-visible">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-foreground">
                      {item.productName}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {formatCents(item.unitPriceCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-md bg-muted px-2 text-xs font-bold text-foreground tabular-nums">
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground tabular-nums">
                      {formatCents(item.unitPriceCents * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right text-base font-bold text-foreground tabular-nums">
                    {formatCents(order.totalCents)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Fulfilment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <OrderTimeline status={order.status} />
              {actions ? (
                <div className="hidden flex-col gap-4 lg:flex">
                  <Separator />
                  {actions}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
      {actions ? (
        <MobileActionBar>
          <div className="flex-1">{actions}</div>
        </MobileActionBar>
      ) : null}
    </div>
  );
}

