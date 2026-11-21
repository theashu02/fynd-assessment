import "./setup"; // must stay first: swaps DATABASE_URL before src/db loads
import { beforeEach, describe, expect, test } from "bun:test";
import { treaty } from "@elysiajs/eden";
import type { App } from "../src/server/app";
import { app } from "../src/server/app";
import { resetDatabase } from "./db";

// In-process client: goes through app.handle, no HTTP server needed,
// but types + status codes + bodies are exactly what HTTP clients get.
const api = treaty<App>(app).api;

// Neon branch = real network round trips; keep the runner patient.
const TIMEOUT = 30_000;

type ProductSuccess = {
  id: string;
  sku: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCents: number;
  stock: number;
};

beforeEach(async () => {
  await resetDatabase();
});

describe("GET /api/products", () => {
  test(
    "returns every product with its stored image URL",
    async () => {
      const { data, error } = await api.products.get();

      expect(error).toBeNull();
      const products = data as ProductSuccess[];
      expect(products.length).toBe(8);
      for (const p of products) {
        expect(typeof p.imageUrl).toBe("string");
        expect(p.imageUrl.length > 0).toBe(true);
        expect(p.imageUrl.startsWith("https://")).toBe(true);
      }
      const urls = new Set(products.map((p) => p.imageUrl));
      expect(urls.size).toBe(products.length);
    },
    TIMEOUT,
  );
});
