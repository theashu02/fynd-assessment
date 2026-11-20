import { Elysia, t } from "elysia";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";

const createOrderBody = t.Object({
  items: t.Array(
    t.Object({
      productId: t.String({ format: "uuid" }),
      quantity: t.Integer({ minimum: 1 }),
    }),
    { minItems: 1 },
  ),
});

const orderItemDto = t.Object({
  id: t.String(),
  productId: t.String(),
  productName: t.String(),
  unitPriceCents: t.Integer(),
  quantity: t.Integer(),
});

const orderDto = t.Object({
  id: t.String(),
  reference: t.String(),
  status: t.Union([
    t.Literal("PLACED"),
    t.Literal("PACKED"),
    t.Literal("SHIPPED"),
    t.Literal("CANCELLED"),
  ]),
  totalCents: t.Integer(),
  createdAt: t.Union([t.Date(), t.String()]),
  updatedAt: t.Union([t.Date(), t.String()]),
  items: t.Array(orderItemDto),
});

const stockDetail = t.Object({
  productId: t.String(),
  requested: t.Integer(),
  available: t.Integer(),
});

const errorDto = t.Object({
  error: t.Object({
    code: t.String(),
    message: t.String(),
    details: t.Optional(t.Array(stockDetail)),
  }),
});

type StockDetail = {
  productId: string;
  requested: number;
  available: number;
};

class OrderCreateError extends Error {
  status: number;
  code: string;
  details?: StockDetail[];

  constructor(status: number, code: string, message: string, details?: StockDetail[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function nextReference(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<string> {
  const raw = (await tx.execute(
    sql`SELECT nextval('order_reference_seq') AS n`,
  )) as unknown as
    | { rows?: Array<{ n?: unknown }> }
    | Array<{ n?: unknown }>;
  const row = Array.isArray(raw) ? raw[0] : raw.rows?.[0];
  const n = Number((row as { n?: unknown } | undefined)?.n);
  if (!Number.isFinite(n)) throw new Error("Failed to generate order reference");
  return `ORD-${Math.trunc(n)}`;
}

export const orderRoutes = new Elysia({ prefix: "/orders" }).post(
  "/",
  async ({ body, set }) => {
    const items = body.items;

    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.productId)) {
        set.status = 400;
        return {
          error: {
            code: "DUPLICATE_PRODUCT",
            message: `Duplicate productId in request: ${item.productId}`,
          },
        };
      }
      seen.add(item.productId);
    }

    // Fixed lock order so two concurrent multi-item orders
    // can never deadlock each other on product rows.
    const sorted = [...items].sort((a, b) =>
      a.productId < b.productId ? -1 : a.productId > b.productId ? 1 : 0,
    );

    try {
      const created = await db.transaction(async (tx) => {
        const ids = sorted.map((i) => i.productId);
        const existing = await tx
          .select({ id: products.id })
          .from(products)
          .where(inArray(products.id, ids));
        const existingIds = new Set(existing.map((p) => p.id));
        const missing = sorted.find((i) => !existingIds.has(i.productId));
        if (missing) {
          throw new OrderCreateError(
            404,
            "UNKNOWN_PRODUCT",
            `Unknown product: ${missing.productId}`,
          );
        }

        const snapshots: Array<{
          productId: string;
          productName: string;
          unitPriceCents: number;
          quantity: number;
        }> = [];

        for (const item of sorted) {
          const updated = await tx
            .update(products)
            .set({ stock: sql`${products.stock} - ${item.quantity}` })
            .where(
              and(
                eq(products.id, item.productId),
                gte(products.stock, item.quantity),
              ),
            )
            .returning({
              id: products.id,
              name: products.name,
              priceCents: products.priceCents,
            });

          const row = updated[0];
          if (!row) {
            const current = await tx
              .select({ stock: products.stock, name: products.name })
              .from(products)
              .where(eq(products.id, item.productId));
            const available = current[0]?.stock ?? 0;
            const label = current[0]?.name ?? item.productId;
            throw new OrderCreateError(
              409,
              "INSUFFICIENT_STOCK",
              `Insufficient stock for ${label}: requested ${item.quantity}, available ${available}`,
              [
                {
                  productId: item.productId,
                  requested: item.quantity,
                  available,
                },
              ],
            );
          }

          snapshots.push({
            productId: row.id,
            productName: row.name,
            unitPriceCents: row.priceCents,
            quantity: item.quantity,
          });
        }

        const totalCents = snapshots.reduce(
          (sum, s) => sum + s.unitPriceCents * s.quantity,
          0,
        );
        const reference = await nextReference(tx);

        const [order] = await tx
          .insert(orders)
          .values({ reference, status: "PLACED", totalCents })
          .returning();

        const rows = await tx
          .insert(orderItems)
          .values(
            snapshots.map((s) => ({
              orderId: order.id,
              productId: s.productId,
              productName: s.productName,
              unitPriceCents: s.unitPriceCents,
              quantity: s.quantity,
            })),
          )
          .returning({
            id: orderItems.id,
            productId: orderItems.productId,
            productName: orderItems.productName,
            unitPriceCents: orderItems.unitPriceCents,
            quantity: orderItems.quantity,
          });

        return {
          id: order.id,
          reference: order.reference,
          status: order.status,
          totalCents: order.totalCents,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: rows,
        };
      });

      set.status = 201;
      return created;
    } catch (err) {
      if (err instanceof OrderCreateError) {
        set.status = err.status;
        return {
          error: {
            code: err.code,
            message: err.message,
            ...(err.details ? { details: err.details } : {}),
          },
        };
      }
      throw err;
    }
  },
  {
    body: createOrderBody,
    response: {
      201: orderDto,
      400: errorDto,
      404: errorDto,
      409: errorDto,
    },
  },
);
