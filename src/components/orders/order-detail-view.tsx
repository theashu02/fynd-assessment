"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DetailSkeleton } from "@/components/loading-skeletons";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { PageHeader } from "@/components/page-header";
import { formatCents } from "@/lib/format";
import {
  useOrder,
  useUpdateOrderStatus,
  type OrderApiError,
  type OrderStatus,
} from "@/lib/orders";
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
  const actions = (
    <OrderActions
      status={order.status}
      isPending={isPending}
      onAdvance={handleStatus}
      onCancel={() => handleStatus("CANCELLED")}
    />
  );

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
        <Card className="min-w-0 border-border bg-card shadow-none">
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
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCents(item.unitPriceCents)}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
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
                  <TableCell className="text-right font-bold">
                    {formatCents(order.totalCents)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle>Fulfilment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <OrderTimeline status={order.status} />
              <Separator />
              {actions}
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileActionBar>
        <div className="flex-1">{actions}</div>
      </MobileActionBar>
    </div>
  );
}

