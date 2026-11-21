# Commerce Order Console

Staff console for taking phone orders: a live product catalogue with stock,
an order builder with a cart, an order list with search/filter, and order
fulfilment (`PLACED → PACKED → SHIPPED`, plus cancel-with-restock from
`PLACED`/`PACKED` only).

## Features

- **New order** (`/orders/new`): searchable/filterable product catalogue,
  quantity steppers clamped to live stock, sticky order summary on desktop,
  bottom bar + sheet on mobile, server-checked totals on submit.
- **Orders** (`/orders`): debounced reference search, status tabs with counts,
  sortable table on desktop, stacked cards on mobile.
- **Order detail** (`/orders/[id]`, accepts uuid or `ORD-…` reference): items
  table with totals, fulfilment timeline, advance/cancel actions with a
  cancel confirmation that states stock will be restored.
- **Catalogue** (`/products`): stat cards, auto-refreshing stock table/bars.
- **API** (`src/server`, Elysia + Eden Treaty): atomic stock decrement on
  placement (concurrent orders can't oversell), server-side totals, guarded
  status transitions, cancel restores stock exactly once, unique `ORD-1001…`
  references from a Postgres sequence.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · lucide-react ·
TanStack Query · Zustand · Elysia + Eden Treaty · Drizzle ORM · Neon Postgres ·
Bun (runtime, package manager, test runner).

## Getting started

Prerequisites: [Bun](https://bun.sh) 1.x and a Neon Postgres database
(any Postgres works for the app; tests want a throwaway Neon branch).

```bash
bun install

# 1. Environment
cp .env.example .env            # then set DATABASE_URL

# 2. Database
bun run db:push                  # create tables from src/db/schema.ts
bun run db:seed                  # load the 8-product catalogue

# 3. Run
bun dev                          # http://localhost:3000 (redirects to /orders/new)
```

If `bun dev` fails to launch Next on your machine, use the direct launcher
instead: `node ./node_modules/next/dist/bin/next dev`.

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `bun dev`         | Start the Next.js dev server                  |
| `bun run build`   | Production build (needs network for fonts)    |
| `bun run start`   | Serve the production build                    |
| `bun run lint`    | ESLint over the whole repo                    |
| `bunx tsc --noEmit` | Strict typecheck                            |
| `bun test`        | Full test suite (needs `.env.test`, see below)|
| `bun run db:push` | Push Drizzle schema to the database           |
| `bun run db:seed` | Upsert the seed catalogue (idempotent)        |
| `bun run db:generate` / `db:migrate` | Generate / apply SQL migrations |

## Testing

```bash
# Offline unit tests (no database needed) - always runnable:
bun test tests/cart-store.test.ts tests/format.test.ts \
  tests/stock.test.ts tests/product-images.test.ts

# Full suite (needs a throwaway database - tests TRUNCATE tables):
cp .env.test.example .env.test   # then set TEST_DATABASE_URL to a Neon branch
bun test
```

Suites: `cart-store` (clamping/add/remove semantics), `format` (currency),
`stock` (stock buckets), `product-images` (seed image URLs), `products`
(catalogue API), `orders` (placement, 409 atomicity, validation errors,
transitions, cancel-restock-once). DB suites run against a real database
through the in-process Eden client (no HTTP server needed).

## Project structure

```
src/app/            Next.js routes: (console)/orders, products, api/[[...slugs]]
src/components/     Feature modules, each with an `index.ts` barrel:
                    new-order/, orders/, products/, sidebar/, ui/ (shadcn),
                    common/ (shared: badges, skeletons, headers, empty states)
src/server/         Elysia app + routes (health, products, orders)
src/db/             Drizzle schema, client, seed catalogue
src/lib/            Eden client, queries, formatting (via `@/lib` barrel)
src/stores/         Zustand cart store, stock-clamped (via `@/stores` barrel)
tests/              bun:test suites (see Testing above)
drizzle/            SQL migrations + snapshots
```

## API overview

Base path `/api` (served by the Next.js catch-all route, typed end-to-end
via Eden Treaty):

| Method | Route                     | Notes                                    |
| ------ | ------------------------- | ---------------------------------------- |
| GET    | `/api/health`             | Liveness probe (`{ ok: true }`)          |
| GET    | `/api/products`           | Full catalogue ordered by name           |
| POST   | `/api/orders`             | Place order; 201, or 400/404/409/422     |
| GET    | `/api/orders?ref=&status=`| Reference search (partial, case-insensitive) + status filter |
| GET    | `/api/orders/:id`         | Detail by uuid or reference (any case)   |
| PATCH  | `/api/orders/:id/status`  | Advance/cancel; illegal moves → 409      |

Error shape: `{ error: { code, message, details? } }`. Stock failures
return code `INSUFFICIENT_STOCK` with per-line `{ productId, requested,
available }` details. Status machine: `PLACED → PACKED → SHIPPED`, and
`PLACED/PACKED → CANCELLED` (restocks exactly once).

## Design system

- Solid colors only, no gradients or blur. All color/spacing/radius values
  are tokens in `src/app/globals.css` — components must not hardcode hex.
- Font: Inter via `next/font`; prices/quantities/totals use `tabular-nums`.
- Motion: 150ms color/border/transform transitions only.

## Environment

| Variable            | File      | Purpose                                  |
| ------------------- | --------- | ---------------------------------------- |
| `DATABASE_URL`      | `.env`    | App + seed database connection string    |
| `NEXT_PUBLIC_APP_URL` | `.env`  | Public origin (default `http://localhost:3000`) |
| `TEST_DATABASE_URL` | `.env.test` | Throwaway branch for DB tests (truncated) |
