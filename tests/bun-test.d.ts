// Minimal ambient types for the bun test runner (the repo does not ship
// bun-types, and this keeps `tsc --noEmit` green without touching app code).
declare module "bun:test" {
  export function test(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number,
  ): void;
  export function describe(name: string, fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export interface Matchers {
    toBe(expected: unknown): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toMatch(pattern: RegExp): void;
    toHaveLength(length: number): void;
  }
  export function expect(actual: unknown): Matchers;
}
