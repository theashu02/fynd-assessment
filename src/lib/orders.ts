import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";

export type OrderStatus = "PLACED" | "PACKED" | "SHIPPED" | "CANCELLED";

export type OrderSummaryRow = {
  id: string;
  reference: string;
  status: OrderStatus;
  totalCents: number;
  itemCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type OrderFilters = {
  ref?: string;
  status?: OrderStatus;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
};

export type OrderDetail = {
  id: string;
  reference: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  items: OrderItem[];
};

export type OrderApiError = {
  status: number;
  code?: string;
  message: string;
};

type EdenError = {
  status?: number;
  value?: unknown;
};

function toOrderApiError(err: unknown, fallback: string): OrderApiError {
  const e = err as EdenError;
  const status = typeof e?.status === "number" ? e.status : 500;
  const value = e?.value as
    | { error?: { code?: string; message?: string } }
    | undefined;
  return {
    status,
    code: value?.error?.code,
    message: value?.error?.message ?? fallback,
  };
}

export async function fetchOrders(filters: OrderFilters): Promise<OrderSummaryRow[]> {
  const query: { ref?: string; status?: OrderStatus } = {};
  if (filters.ref) query.ref = filters.ref;
  if (filters.status) query.status = filters.status;
  const { data, error } = await api.orders.get({ query });
  if (error) throw toOrderApiError(error, "Failed to load orders");
  if (!data) throw new Error("Failed to load orders");
  return data as OrderSummaryRow[];
}

export function useOrders(filters: OrderFilters) {
  const { ref, status } = filters;
  return useQuery({
    queryKey: ["orders", ref ?? "", status ?? "ALL"],
    queryFn: () => fetchOrders({ ref, status }),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export async function fetchOrder(id: string): Promise<OrderDetail> {
  const { data, error } = await api.orders({ id }).get();
  if (error) throw toOrderApiError(error, "Failed to load order");
  if (!data || !("reference" in data)) throw new Error("Failed to load order");
  return data as OrderDetail;
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
    staleTime: 15_000,
  });
}

export function useUpdateOrderStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: OrderStatus): Promise<OrderDetail> => {
      const { data, error } = await api
        .orders({ id })
        .status.patch({ status });
      if (error) throw toOrderApiError(error, "Failed to update order");
      if (!data || !("reference" in data)) {
        throw new Error("Unexpected response from server");
      }
      return data as OrderDetail;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

