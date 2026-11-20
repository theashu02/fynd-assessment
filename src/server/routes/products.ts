import { Elysia, t } from "elysia";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

const productDto = t.Object({
  id: t.String(),
  sku: t.String(),
  name: t.String(),
  description: t.String(),
  priceCents: t.Integer(),
  stock: t.Integer(),
});

export const productRoutes = new Elysia({ prefix: "/products" }).get(
  "/",
  async () => {
    return await db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        description: products.description,
        priceCents: products.priceCents,
        stock: products.stock,
      })
      .from(products)
      .orderBy(asc(products.name));
  },
  {
    response: t.Array(productDto),
  },
);
