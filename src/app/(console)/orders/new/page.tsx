import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { PageHeader } from "@/components/page-header";
import { FormSkeleton } from "@/components/loading-skeletons";

export default function NewOrderPage() {
  return (
    <div>
      <PageHeader
        title="New Order"
        subtitle="Take a phone order - pick products, confirm the total, submit."
        action={
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/orders">View orders</Link>
          </Button>
        }
      />
      <Card className="border-border bg-card shadow-none">
        <CardHeader>
          <CardTitle>Build order</CardTitle>
          <CardDescription>Catalogue picker and totals land here next.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Order builder UI comes in the next step. Stock is validated on the server at submit time.
          </p>
          <div className="mt-4">
            <Button disabled>Submit order</Button>
          </div>
        </CardContent>
      </Card>
      <MobileActionBar>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/orders">View orders</Link>
        </Button>
        <Button disabled className="flex-1">
          Submit order
        </Button>
      </MobileActionBar>
    </div>
  );
}
