import { create } from "zustand";

type CartState = {
  items: Record<string, number>;
  setQty: (productId: string, qty: number, maxStock?: number) => void;
  add: (productId: string, qty: number, maxStock: number) => void;
  increment: (productId: string, maxStock: number) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

function clampQty(qty: number, maxStock?: number): number {
  const floored = Math.floor(qty);
  if (!Number.isFinite(floored) || floored <= 0) return 0;
  if (typeof maxStock === "number") return Math.min(floored, Math.max(0, maxStock));
  return floored;
}

export const useCartStore = create<CartState>()((set) => ({
  items: {},
  setQty: (productId, qty, maxStock) =>
    set((s) => {
      const next = clampQty(qty, maxStock);
      const items = { ...s.items };
      if (next <= 0) delete items[productId];
      else items[productId] = next;
      return { items };
    }),
  add: (productId, qty, maxStock) =>
    set((s) => {
      const current = s.items[productId] ?? 0;
      const next = clampQty(current + qty, maxStock);
      const items = { ...s.items };
      if (next <= 0) delete items[productId];
      else items[productId] = next;
      return { items };
    }),
  increment: (productId, maxStock) =>
    set((s) => {
      const current = s.items[productId] ?? 0;
      const next = clampQty(current + 1, maxStock);
      if (next === current) return s;
      return { items: { ...s.items, [productId]: next } };
    }),
  decrement: (productId) =>
    set((s) => {
      const current = s.items[productId] ?? 0;
      const items = { ...s.items };
      if (current <= 1) delete items[productId];
      else items[productId] = current - 1;
      return { items };
    }),
  remove: (productId) =>
    set((s) => {
      if (!(productId in s.items)) return s;
      const items = { ...s.items };
      delete items[productId];
      return { items };
    }),
  clear: () => set({ items: {} }),
}));

export function cartCount(items: Record<string, number>): number {
  return Object.values(items).reduce((a, b) => a + b, 0);
}

