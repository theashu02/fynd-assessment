import { sql } from "drizzle-orm";
import { db } from "../src/db/index";
import { products } from "../src/db/schema";
import { CATALOGUE } from "../src/db/seed";

export async function resetDatabase() {
  await db.execute(
    sql`TRUNCATE TABLE order_items, orders, products RESTART IDENTITY CASCADE`,
  );
  await db.execute(sql`ALTER SEQUENCE order_reference_seq RESTART WITH 1001`);
  await db.insert(products).values(CATALOGUE);
}
