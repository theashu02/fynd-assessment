import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="product-grid grid grid-cols-1 gap-6 p-1 sm:grid-cols-2 sm:p-2 lg:grid-cols-1 lg:gap-8 xl:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[480px] w-full rounded-2xl" />
      ))}
    </div>
  );
}
