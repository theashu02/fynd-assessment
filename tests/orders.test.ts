import "./setup"; // must stay first: swaps DATABASE_URL before src/db loads
import { beforeEach, describe, expect, test } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { eq } from "drizzle-orm";
import type { App } from "../src/server/app";
import { app } from "../src/server/app";
import { db } from "../src/db/index";
import { orders, products } from "../src/db/schema";
import { resetDatabase } from "./db";

// In-process client: goes through app.handle, no HTTP server needed,
// but types + status codes + bodies are exactly what HTTP clients get.
const api = treaty<App>(app).api;

// Neon branch = real network round trips; keep the runner patient.
const TIMEOUT = 30_000;

// Eden types `data` as a union over every declared response body, so tests
// narrow the 2xx shape explicitly after asserting `error` is null.
type OrderSuccess = {
  id: string;
  reference: string;
  status: "PLACED" | "PACKED" | "SHIPPED" | "CANCELLED";
  totalCents: number;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    unitPriceCents: number;
    quantity: number;
  }>;
};

function asOrder(data: unknown): OrderSuccess {
  return data as OrderSuccess;
}

function errorStatus(error: unknown): number | undefined {
  return (error as { status?: unknown } | null)?.status as number | undefined;
}

function errorCode(error: unknown): string | undefined {
  const value = (error as { value?: unknown } | null)?.value as
    | { error?: { code?: unknown } }
    | undefined;
  return typeof value?.error?.code === "string"
    ? value.error.code
    : undefined;
}

async function productBySku(sku: string) {
  const rows = await db.select().from(products).where(eq(products.sku, sku));
  const row = rows[0];
  if (!row) throw new Error(`seed product missing: ${sku}`);
  return row;
}

async function setStock(sku: string, stock: number) {
  await db.update(products).set({ stock }).where(eq(products.sku, sku));
  return productBySku(sku);
}

async function stockOf(productId: string) {
  const rows = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, productId));
  return rows[0]?.stock;
}

async function countOrders() {
  return (await db.select({ id: orders.id }).from(orders)).length;
}

async function placeOne(sku: string, quantity: number): Promise<OrderSuccess> {
  const product = await productBySku(sku);
  const { data, error } = await api.orders.post({
    items: [{ productId: product.id, quantity }],
  });
  expect(error).toBeNull();
  return asOrder(data);
}

beforeEach(async () => {
  await resetDatabase();
});

describe("POST /api/orders", () => {
  test(
    "places an order: PLACED, reference generated, total correct, stock decreases",
    async () => {
      const mouse = await productBySku("WMOUSE-01"); // 2499c, stock 60

      const { data, error } = await api.orders.post({
        items: [{ productId: mouse.id, quantity: 2 }],
      });

      expect(error).toBeNull();
      const order = asOrder(data);
      expect(order.status).toBe("PLACED");
      expect(order.reference).toMatch(/^ORD-\d+$/);
      expect(order.totalCents).toBe(2 * mouse.priceCents);
      expect(order.items).toHaveLength(1);
      expect(order.items[0]!.productId).toBe(mouse.id);
      expect(await stockOf(mouse.id)).toBe(mouse.stock - 2);
    },
    TIMEOUT,
  );

  test(
    "acceptance: 2xA (stock 5) + 1xB (stock 0) -> 409, A untouched, zero orders",
    async () => {
      const a = await setStock("WMOUSE-01", 5);
      const b = await productBySku("HEADNC-05"); // seeded stock 0
      expect(b.stock).toBe(0);

      const { data, error } = await api.orders.post({
        items: [
          { productId: a.id, quantity: 2 },
          { productId: b.id, quantity: 1 },
        ],
      });

      expect(data).toBeNull();
      expect(errorStatus(error)).toBe(409);
      expect(errorCode(error)).toBe("INSUFFICIENT_STOCK");
      expect(await stockOf(a.id)).toBe(5);
      expect(await countOrders()).toBe(0);
    },
    TIMEOUT,
  );
});

describe("order validation", () => {
  test(
    "rejects empty items with 422",
    async () => {
      const { data, error } = await api.orders.post({ items: [] });
      expect(data).toBeNull();
      expect(errorStatus(error)).toBe(422);
      expect(await countOrders()).toBe(0);
    },
    TIMEOUT,
  );

  test(
    "rejects quantity 0 with 422",
    async () => {
      const mouse = await productBySku("WMOUSE-01");
      const { data, error } = await api.orders.post({
        items: [{ productId: mouse.id, quantity: 0 }],
      });
      expect(data).toBeNull();
      expect(errorStatus(error)).toBe(422);
      expect(await stockOf(mouse.id)).toBe(mouse.stock);
    },
    TIMEOUT,
  );

  test(
    "rejects duplicate products with 400 DUPLICATE_PRODUCT",
    async () => {
      const mouse = await productBySku("WMOUSE-01");
      const { data, error } = await api.orders.post({
        items: [
          { productId: mouse.id, quantity: 1 },
          { productId: mouse.id, quantity: 1 },
        ],
      });
      expect(data).toBeNull();
      expect(errorStatus(error)).toBe(400);
      expect(errorCode(error)).toBe("DUPLICATE_PRODUCT");
      expect(await countOrders()).toBe(0);
    },
    TIMEOUT,
  );

  test(
    "rejects unknown product with 404 UNKNOWN_PRODUCT",
    async () => {
      const { data, error } = await api.orders.post({
        items: [
          {
            productId: "00000000-0000-0000-0000-000000000000",
            quantity: 1,
          },
        ],
      });
      expect(data).toBeNull();
      expect(errorStatus(error)).toBe(404);
      expect(errorCode(error)).toBe("UNKNOWN_PRODUCT");
      expect(await countOrders()).toBe(0);
    },
    TIMEOUT,
  );
});

describe("order fulfilment", () => {
  test(
    "happy path: PLACED -> PACKED -> SHIPPED",
    async () => {
      const order = await placeOne("WMOUSE-01", 1);

      const packed = await api.orders({ id: order.id }).status.patch({
        status: "PACKED",
      });
      expect(packed.error).toBeNull();
      expect(asOrder(packed.data).status).toBe("PACKED");

      const shipped = await api.orders({ id: order.id }).status.patch({
        status: "SHIPPED",
      });
      expect(shipped.error).toBeNull();
      expect(asOrder(shipped.data).status).toBe("SHIPPED");

      const detail = await api.orders({ id: order.id }).get();
      expect(detail.error).toBeNull();
      expect(asOrder(detail.data).status).toBe("SHIPPED");
    },
    TIMEOUT,
  );

  test(
    "rejects skipped transition PLACED -> SHIPPED with 409",
    async () => {
      const order = await placeOne("WMOUSE-01", 1);

      const { data, error } = await api
        .orders({ id: order.id })
        .status.patch({ status: "SHIPPED" });

      expect(data).toBeNull();
      expect(errorStatus(error)).toBe(409);
      expect(errorCode(error)).toBe("INVALID_TRANSITION");

      const detail = await api.orders({ id: order.id }).get();
      expect(asOrder(detail.data).status).toBe("PLACED");
    },
    TIMEOUT,
  );

  test(
    "rejects SHIPPED -> CANCELLED with 409",
    async () => {
      const order = await placeOne("WMOUSE-01", 1);
      await api.orders({ id: order.id }).status.patch({ status: "PACKED" });
      await api.orders({ id: order.id }).status.patch({ status: "SHIPPED" });

      const { data, error } = await api
        .orders({ id: order.id })
        .status.patch({ status: "CANCELLED" });

      expect(data).toBeNull();
      expect(errorStatus(error)).toBe(409);
      expect(errorCode(error)).toBe("INVALID_TRANSITION");
    },
    TIMEOUT,
  );

  test(
    "cancel restores stock exactly once: second cancel -> 409, stock unchanged",
    async () => {
      const a = await setStock("WMOUSE-01", 5);
      const order = await placeOne("WMOUSE-01", 2);
      expect(await stockOf(a.id)).toBe(3);

      const cancelled = await api
        .orders({ id: order.id })
        .status.patch({ status: "CANCELLED" });
      expect(cancelled.error).toBeNull();
      expect(asOrder(cancelled.data).status).toBe("CANCELLED");
      expect(await stockOf(a.id)).toBe(5);

      const again = await api
        .orders({ id: order.id })
        .status.patch({ status: "CANCELLED" });
      expect(again.data).toBeNull();
      expect(errorStatus(again.error)).toBe(409);
      expect(errorCode(again.error)).toBe("INVALID_TRANSITION");
      expect(await stockOf(a.id)).toBe(5);
    },
    TIMEOUT,
  );
});
