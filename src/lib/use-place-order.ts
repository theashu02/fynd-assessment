import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProductDto } from "@/lib/products";

export type StockFailure = {
  productId: string;
  requested: number;
  available: number;
};

export type PlaceOrderError = {
  status: number;
  code?: string;
  message: string;
  details?: StockFailure[];
};

export type PlacedOrder = {
  id: string;
  reference: string;
  status: "PLACED" | "PACKED" | "SHIPPED" | "CANCELLED";
  totalCents: number;
};

type EdenError = {
  status?: number;
  value?: unknown;
};

function toPlaceOrderError(err: unknown): PlaceOrderError {
  const e = err as EdenError;
  const status = typeof e?.status === "number" ? e.status : 500;
  const value = e?.value as
    | { error?: { code?: string; message?: string; details?: StockFailure[] } }
    | undefined;
  return {
    status,
    code: value?.error?.code,
    message: value?.error?.message ?? "Failed to place order",
    details: value?.error?.details,
  };
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { productId: string; quantity: number }[]): Promise<PlacedOrder> => {
      const { data, error } = await api.orders.post({ items });
      if (error) throw toPlaceOrderError(error);
      if (!data || !("reference" in data)) {
        throw { status: 500, message: "Unexpected response from server" } as PlaceOrderError;
      }
      return data as PlacedOrder;
    },
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previous = queryClient.getQueryData<ProductDto>(["products"]);
      const qtyById = new Map(items.map((i) => [i.productId, i.quantity]));
      queryClient.setQueryData<ProductDto>(["products"], (old) => {
        if (!old) return old;
        return old.map((p) => {
          const qty = qtyById.get(p.id) ?? 0;
          if (qty <= 0) return p;
          return { ...p, stock: Math.max(0, p.stock - qty) };
        });
      });
      return { previous };
    },
    onError: (_err, _items, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["products"], context.previous);
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

