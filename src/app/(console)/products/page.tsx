import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function ProductsPage() {
  return (
    <div>
      <PageHeader
        title="Catalogue"
        subtitle="Stock levels update live when orders are placed or cancelled."
      />
      <Card className="border-border bg-card shadow-none">
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Catalogue grid lands here next.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">8 seeded products, one out of stock.</p>
        </CardContent>
      </Card>
    </div>
  );
}
