import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { PageHeader } from "@/components/page-header";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageHeader
        title={`Order ${id}`}
        subtitle="Items, quantities, total and fulfilment actions."
        action={
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/orders">Back to orders</Link>
          </Button>
        }
      />
      <Card className="border-border bg-card shadow-none">
        <CardHeader>
          <CardTitle>Order detail</CardTitle>
          <CardDescription>Fulfilment timeline lands here next.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Detail view for {id}. Status changes are validated on the server.
          </p>
        </CardContent>
      </Card>
      <MobileActionBar>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/orders">Back</Link>
        </Button>
        <Button disabled className="flex-1">
          Advance status
        </Button>
      </MobileActionBar>
    </div>
  );
}

