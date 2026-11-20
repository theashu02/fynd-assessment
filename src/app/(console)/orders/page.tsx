import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function OrdersPage() {
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
      <Card className="border-border bg-card shadow-none">
        <CardHeader>
          <CardTitle>All orders</CardTitle>
          <CardDescription>Search + status filter land here next.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No orders yet - create one from New Order.</p>
        </CardContent>
      </Card>
    </div>
  );
}
