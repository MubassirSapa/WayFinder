import { requireEnv } from "@/lib/env";

export type DatabaseEngine = "mongo" | "sql";

const DATABASE_ENGINES = new Set<DatabaseEngine>(["mongo", "sql"]);

export function requireDatabaseEnv() {
  const engine = (process.env.DATABASE_ENGINE || "sql").toLowerCase();

  if (!DATABASE_ENGINES.has(engine as DatabaseEngine)) {
    throw new Error(
      `Invalid DATABASE_ENGINE: ${engine}. Expected "sql" or "mongo".`,
    );
  }

  return {
    engine: engine as DatabaseEngine,
    url: requireEnv("DATABASE_URL"),
    // Prints every SQL statement Drizzle runs (SQLite only) — verbose, so it
    // stays opt-in via env instead of a hardcoded true.
    logger: process.env.DATABASE_LOGGER === "true",
  };
}
