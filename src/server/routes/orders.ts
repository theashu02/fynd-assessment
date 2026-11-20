import { Elysia, t } from "elysia";
import { and, desc, eq, gte, ilike, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const statusEnum = t.Union([
  t.Literal("PLACED"),
  t.Literal("PACKED"),
  t.Literal("SHIPPED"),
  t.Literal("CANCELLED"),
]);

type Status = "PLACED" | "PACKED" | "SHIPPED" | "CANCELLED";

// Allowed NEXT statuses per CURRENT status. Enforced only here on the server.
const TRANSITIONS: Record<Status, Status[]> = {
  PLACED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: [],
  CANCELLED: [],
};

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
  status: statusEnum,
  totalCents: t.Integer(),
  createdAt: t.Union([t.Date(), t.String()]),
  updatedAt: t.Union([t.Date(), t.String()]),
  items: t.Array(orderItemDto),
});

const orderSummaryDto = t.Object({
  id: t.String(),
  reference: t.String(),
  status: statusEnum,
  totalCents: t.Integer(),
  itemCount: t.Integer(),
  createdAt: t.Union([t.Date(), t.String()]),
  updatedAt: t.Union([t.Date(), t.String()]),
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

class OrderRequestError extends Error {
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

function toErrorBody(err: OrderRequestError) {
  return {
    error: {
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  };
}

async function nextReference(tx: Tx): Promise<string> {
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findOrderRow(dbOrTx: Tx | typeof db, key: string) {
  if (UUID_RE.test(key)) {
    const byId = await dbOrTx
      .select()
      .from(orders)
      .where(eq(orders.id, key));
    if (byId[0]) return byId[0];
  }
  // Case-insensitive exact reference match (NOT partial: detail lookup).
  const byRef = await dbOrTx
    .select()
    .from(orders)
    .where(sql`upper(${orders.reference}) = upper(${key})`);
  return byRef[0];
}

async function loadFullOrder(dbOrTx: Tx | typeof db, orderId: string) {
  const rows = await dbOrTx.select().from(orders).where(eq(orders.id, orderId));
  const order = rows[0];
  if (!order) return undefined;
  const items = await dbOrTx
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      productName: orderItems.productName,
      unitPriceCents: orderItems.unitPriceCents,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    totalCents: order.totalCents,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items,
  };
}

function escapeLike(s: string) {
  return s.replace(/[%_\\]/g, (m) => `\\${m}`);
}

export const orderRoutes = new Elysia({ prefix: "/orders" })
  .post(
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
            throw new OrderRequestError(
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
            // ATOMIC check-and-decrement: the row matches only when
            // enough stock exists, so concurrent placements cannot
            // oversell the same units.
            //   UPDATE products SET stock = stock - $qty
            //   WHERE id = $id AND stock >= $qty RETURNING id, name, price_cents
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
              throw new OrderRequestError(
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
        if (err instanceof OrderRequestError) {
          set.status = err.status;
          return toErrorBody(err);
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
  )
  .get(
    "/",
    async ({ query }) => {
      const ref = query.ref?.trim() ? query.ref.trim() : undefined;
      const conditions = [];
      if (ref) {
        // Case-insensitive PARTIAL match on reference.
        //   ... WHERE reference ILIKE '%<ref>%' (wildcards escaped)
        conditions.push(ilike(orders.reference, `%${escapeLike(ref)}%`));
      }
      if (query.status) conditions.push(eq(orders.status, query.status));

      //   SELECT orders.*, count(order_items.id)::int AS item_count
      //   FROM orders LEFT JOIN order_items ON order_items.order_id = orders.id
      //   WHERE ... GROUP BY orders.id ORDER BY orders.created_at DESC
      // (GROUP BY PK covers the whole row in Postgres.)
      const rows = await db
        .select({
          id: orders.id,
          reference: orders.reference,
          status: orders.status,
          totalCents: orders.totalCents,
          itemCount: sql<number>`count(${orderItems.id})::int`,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
        })
        .from(orders)
        .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .groupBy(orders.id)
        .orderBy(desc(orders.createdAt));

      return rows;
    },
    {
      query: t.Object({
        ref: t.Optional(t.String()),
        status: t.Optional(statusEnum),
      }),
      response: t.Array(orderSummaryDto),
    },
  )
  .get(
    "/:id",
    async ({ params, set }) => {
      // Accepts either the uuid or the human reference (any case).
      // The uuid is only queried as uuid: no more invalid-uuid 500s.
      const resolved = await findOrderRow(db, params.id);
      if (!resolved) {
        set.status = 404;
        return {
          error: { code: "ORDER_NOT_FOUND", message: "Order not found" },
        };
      }
      const full = await loadFullOrder(db, resolved.id);
      if (!full) {
        set.status = 404;
        return {
          error: { code: "ORDER_NOT_FOUND", message: "Order not found" },
        };
      }
      return full;
    },
    {
      params: t.Object({ id: t.String({ minLength: 1 }) }),
      response: { 200: orderDto, 404: errorDto },
    },
  )
  .patch(
    "/:id/status",
    async ({ params, body, set }) => {
      const next = body.status as Status;
      // Inverse of TRANSITIONS: which CURRENT statuses may move to `next`?
      const allowedFrom = (Object.keys(TRANSITIONS) as Status[]).filter((s) =>
        TRANSITIONS[s].includes(next),
      );

      try {
        const result = await db.transaction(async (tx) => {
          // Accept either the uuid or the human reference as the key.
          const existing = await findOrderRow(tx, params.id);
          if (!existing) {
            throw new OrderRequestError(
              404,
              "ORDER_NOT_FOUND",
              "Order not found",
            );
          }
          const targetId = existing.id;

          // ATOMIC guarded transition: only one current status wins.
          //   UPDATE orders SET status = $new, updated_at = now()
          //   WHERE id = $id AND status = ANY($allowedFrom) RETURNING *
          const moved = await tx
            .update(orders)
            .set({ status: next, updatedAt: new Date() })
            .where(
              and(
                eq(orders.id, targetId),
                allowedFrom.length
                  ? inArray(orders.status, allowedFrom)
                  : sql`false`,
              ),
            )
            .returning();

          if (!moved[0]) {
            throw new OrderRequestError(
              409,
              "INVALID_TRANSITION",
              `Cannot move from ${existing.status} to ${next}`,
            );
          }

          if (next === "CANCELLED") {
            // Restore stock EXACTLY ONCE: the guarded UPDATE above already
            // succeeded (so this is the one legal cancel), and the flag
            // below makes any repeat a no-op even if reached.
            //   UPDATE products SET stock = stock + $qty WHERE id = $pid
            //   UPDATE orders SET stock_restored = true WHERE id = $id
            const [flag] = await tx
              .select({
                stockRestored: orders.stockRestored,
                id: orders.id,
              })
              .from(orders)
              .where(eq(orders.id, moved[0].id));

            if (!flag.stockRestored) {
              const items = await tx
                .select({
                  productId: orderItems.productId,
                  quantity: orderItems.quantity,
                })
                .from(orderItems)
                .where(eq(orderItems.orderId, moved[0].id));

              for (const item of items) {
                await tx
                  .update(products)
                  .set({
                    stock: sql`${products.stock} + ${item.quantity}`,
                  })
                  .where(eq(products.id, item.productId));
              }
              await tx
                .update(orders)
                .set({ stockRestored: true })
                .where(eq(orders.id, moved[0].id));
            }
          }

          const full = await loadFullOrder(tx, moved[0].id);
          if (!full) throw new Error("Order vanished mid-transition");
          return full;
        });

        return result;
      } catch (err) {
        if (err instanceof OrderRequestError) {
          set.status = err.status;
          return toErrorBody(err);
        }
        throw err;
      }
    },
    {
      params: t.Object({ id: t.String({ minLength: 1 }) }),
      body: t.Object({ status: statusEnum }),
      response: { 200: orderDto, 400: errorDto, 404: errorDto, 409: errorDto },
    },
  );
