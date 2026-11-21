import { describe, expect, test } from "bun:test";
import { CATALOGUE } from "../src/db/seed";

// No database needed: guards the seed data itself, so a product can never
// ship without a usable image URL.
describe("catalogue product images", () => {
  test("every product has a unique https image URL", () => {
    expect(CATALOGUE.length > 0).toBe(true);
    const seen = new Set<string>();
    for (const item of CATALOGUE) {
      expect(typeof item.imageUrl).toBe("string");
      expect(item.imageUrl!.length > 0).toBe(true);
      const url = new URL(item.imageUrl!);
      expect(url.protocol).toBe("https:");
      expect(seen.has(item.imageUrl!)).toBe(false);
      seen.add(item.imageUrl!);
    }
  });
});
