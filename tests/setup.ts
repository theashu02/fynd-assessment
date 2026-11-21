import { config } from "dotenv";

config({ path: ".env.test" });

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) {
  throw new Error(
    "TEST_DATABASE_URL is not set. Create a Neon branch for tests, copy .env.test.example to .env.test, and paste the branch connection string.",
  );
}
process.env.DATABASE_URL = testUrl;
