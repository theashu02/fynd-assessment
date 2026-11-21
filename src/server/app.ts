import { Elysia } from "elysia";
import { healthRoutes } from "./routes/health";
import { orderRoutes } from "./routes/orders";
import { productRoutes } from "./routes/products";

export const app = new Elysia({ prefix: "/api" })
  .onError(({ code, error, set }) => {
    const errorStatus = (error as { status?: unknown } | undefined)?.status;
    const status =
      code === "NOT_FOUND"
        ? 404
        : code === "VALIDATION"
          ? 422
          : code === "PARSE"
            ? 400
            : typeof errorStatus === "number"
              ? errorStatus
              : 500;
    set.status = status;
    return {
      error: {
        code: typeof code === "string" ? code : "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
    };
  })
  .use(healthRoutes)
  .use(productRoutes)
  .use(orderRoutes);

export type App = typeof app;
