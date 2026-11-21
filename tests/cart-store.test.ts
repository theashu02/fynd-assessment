import { beforeEach, describe, expect, test } from "bun:test";
import { cartCount, useCartStore } from "../src/stores/cart-store";

// No database needed: pure store logic (clamping, add/remove semantics).

beforeEach(() => {
  useCartStore.setState({ items: {} });
});

function items() {
  return useCartStore.getState().items;
}

describe("cart store", () => {
  test("add() accumulates quantity for the same product", () => {
    const { add } = useCartStore.getState();
    add("p1", 1, 10);
    add("p1", 2, 10);
    expect(items()["p1"]).toBe(3);
  });

  test("add() clamps to maxStock and never exceeds it", () => {
    const { add } = useCartStore.getState();
    add("p1", 9, 10);
    add("p1", 5, 10);
    expect(items()["p1"]).toBe(10);
  });

  test("add() with zero stock leaves the cart empty", () => {
    const { add } = useCartStore.getState();
    add("p1", 1, 0);
    expect(items()["p1"]).toBeUndefined();
  });

  test("increment() stops at maxStock", () => {
    const { add, increment } = useCartStore.getState();
    add("p1", 1, 2);
    increment("p1", 2);
    increment("p1", 2);
    expect(items()["p1"]).toBe(2);
  });

  test("decrement() removes the line at zero", () => {
    const { add, decrement } = useCartStore.getState();
    add("p1", 2, 10);
    decrement("p1");
    expect(items()["p1"]).toBe(1);
    decrement("p1");
    expect(items()["p1"]).toBeUndefined();
  });

  test("setQty() clamps and drops non-positive quantities", () => {
    const { setQty } = useCartStore.getState();
    setQty("p1", 99, 4);
    expect(items()["p1"]).toBe(4);
    setQty("p1", 0, 4);
    expect(items()["p1"]).toBeUndefined();
  });

  test("remove() and clear() empty the cart", () => {
    const { add, remove, clear } = useCartStore.getState();
    add("p1", 1, 10);
    add("p2", 3, 10);
    remove("p1");
    expect(items()["p1"]).toBeUndefined();
    expect(items()["p2"]).toBe(3);
    clear();
    expect(Object.keys(items())).toHaveLength(0);
  });

  test("cartCount() sums quantities across lines", () => {
    const { add } = useCartStore.getState();
    add("p1", 2, 10);
    add("p2", 3, 10);
    expect(cartCount(items())).toBe(5);
  });
});
