import { describe, expect, test } from "bun:test";
import { formatCents } from "../src/lib/format";

// No database needed: pure formatting.

describe("formatCents", () => {
  test("formats dollars and cents", () => {
    expect(formatCents(2499)).toBe("$24.99");
  });

  test("formats zero and whole dollars", () => {
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(100)).toBe("$1.00");
  });

  test("groups thousands", () => {
    expect(formatCents(123456)).toBe("$1,234.56");
  });
});
