import { Suspense } from "react";
import { DetailSkeleton } from "@/components/common";
import { OrderDetailView } from "@/components/orders";

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

