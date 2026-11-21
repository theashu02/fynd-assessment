import { describe, expect, test } from "bun:test";
import { stockState } from "../src/components/common/stock-badge";
import { stockFill } from "../src/components/products/stock-bar";

// No database needed: pure stock-bucket logic shared by badges and bars.

describe("stockState", () => {
  test("zero and negative stock are out", () => {
    expect(stockState(0)).toBe("out");
    expect(stockState(-3)).toBe("out");
  });

  test("1..5 are low, 6+ are in", () => {
    expect(stockState(1)).toBe("low");
    expect(stockState(5)).toBe("low");
    expect(stockState(6)).toBe("in");
    expect(stockState(200)).toBe("in");
  });
});

describe("stockFill", () => {
  test("maps buckets to theme color classes", () => {
    expect(stockFill(0)).toBe("bg-destructive");
    expect(stockFill(3)).toBe("bg-accent");
    expect(stockFill(60)).toBe("bg-success");
  });
});
