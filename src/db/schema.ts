import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "PLACED",
  "PACKED",
  "SHIPPED",
  "CANCELLED",
]);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

// Backs human-readable order references (ORD-1001, ORD-1002, ...).
// The API takes the next sequence value inside the placement
// transaction, so concurrent orders can never share a reference.
export const orderReferenceSeq = pgSequence("order_reference_seq", {
  startWith: 1001,
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sku: text("sku").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    priceCents: integer("price_cents").notNull().default(0),
    stock: integer("stock").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check("products_price_cents_non_negative", sql`${t.priceCents} >= 0`),
    check("products_stock_non_negative", sql`${t.stock} >= 0`),
  ],
);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").notNull().unique(),
  status: orderStatusEnum("status").notNull().default("PLACED"),
  totalCents: integer("total_cents").notNull().default(0),
  // Set to true the one time stock is restored on cancel, so a
  // retried/duplicate cancel can never restore twice.
  stockRestored: boolean("stock_restored").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    // Snapshots taken at placement, so later catalogue edits
    // never rewrite order history.
    productName: text("product_name").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;


