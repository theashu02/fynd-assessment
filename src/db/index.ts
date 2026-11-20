import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Required for the Pool (interactive transactions) outside serverless runtimes.
neonConfig.webSocketConstructor = ws;

// No connection is opened until the first query, so importing this module
// never connects. Set DATABASE_URL in .env (see .env.example).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export type Db = typeof db;
