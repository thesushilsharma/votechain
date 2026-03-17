import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the .env file");
}

export default defineConfig({
  schema: "./src/schema.ts", // Your schema file path
  out: "./src/db/drizzle", // Your migrations folder
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  entities: {
    roles: true,
  },
});