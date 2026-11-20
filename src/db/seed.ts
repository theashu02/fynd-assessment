import "dotenv/config";
import { db } from "./index";
import { products, type NewProduct } from "./schema";

export const CATALOGUE: NewProduct[] = [
  {
    sku: "WMOUSE-01",
    name: "Wireless Mouse",
    description: "2.4GHz ergonomic wireless mouse, silent clicks",
    priceCents: 2499,
    stock: 60,
  },
  {
    sku: "KEYBD-02",
    name: "Mechanical Keyboard",
    description: "Tenkeyless mechanical keyboard, brown switches",
    priceCents: 7499,
    stock: 35,
  },
  {
    sku: "MON27-03",
    name: "27-inch 4K Monitor",
    description: "27-inch IPS 4K display, height-adjustable stand",
    priceCents: 32999,
    stock: 12,
  },
  {
    sku: "HUBC-04",
    name: "USB-C Docking Hub",
    description: "7-in-1 USB-C hub with HDMI, PD passthrough and card reader",
    priceCents: 8999,
    stock: 40,
  },
  {
    sku: "HEADNC-05",
    name: "Noise-Cancelling Headphones",
    description: "Over-ear Bluetooth headphones with active noise cancellation",
    priceCents: 12999,
    stock: 0,
  },
  {
    sku: "NOTEA4-06",
    name: "A4 Notebook (Pack of 3)",
    description: "Ruled A4 notebooks, 192 pages each",
    priceCents: 999,
    stock: 200,
  },
  {
    sku: "PENGEL-07",
    name: "Gel Pen Set (10 pcs)",
    description: "Quick-dry gel pens, assorted ink colours",
    priceCents: 499,
    stock: 3,
  },
  {
    sku: "LAMPLED-08",
    name: "LED Desk Lamp",
    description: "Dimmable LED desk lamp with USB charging port",
    priceCents: 3499,
    stock: 25,
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
  }
  
  for (const item of CATALOGUE) {
    await db
      .insert(products)
      .values(item)
      .onConflictDoUpdate({
        target: products.sku,
        set: {
          name: item.name,
          description: item.description,
          priceCents: item.priceCents,
          stock: item.stock,
        },
      });
  }
}

const invokedDirectly = typeof process !== "undefined" && (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("src/db/seed.ts");
if (invokedDirectly) {
  main()
    .then(() => {
      console.log(`Seeded ${CATALOGUE.length} products (stock reset, no duplicates).`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
