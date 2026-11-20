import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ProductDto = Awaited<
  ReturnType<typeof fetchProducts>
>;

export async function fetchProducts() {
  const { data, error } = await api.products.get();
  if (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Failed to load products";
    throw new Error(message);
  }
  if (!data) throw new Error("Failed to load products");
  return data;
}

export function useProducts(options?: { refetchIntervalMs?: number }) {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 15_000,
    refetchInterval: options?.refetchIntervalMs ?? false,
  });
}

