import { Suspense } from "react";
import { DetailSkeleton } from "@/components/loading-skeletons";
import { OrderDetailView } from "@/components/orders/order-detail-view";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <OrderDetailView id={id} />
    </Suspense>
  );
}

