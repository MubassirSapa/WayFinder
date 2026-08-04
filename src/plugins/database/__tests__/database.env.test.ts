import { afterEach, describe, expect, it, vi } from "vitest";

import { requireDatabaseEnv } from "../database.env";

describe("requireDatabaseEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses SQL by default", () => {
    vi.stubEnv("DATABASE_ENGINE", "");
    vi.stubEnv("DATABASE_URL", "file:./test.db");

    expect(requireDatabaseEnv()).toEqual({
      engine: "sql",
      url: "file:./test.db",
      logger: false,
    });
  });

  it("selects MongoDB from the environment", () => {
    vi.stubEnv("DATABASE_ENGINE", "mongo");
    vi.stubEnv("DATABASE_URL", "mongodb://localhost:27017/wayfinder");

    expect(requireDatabaseEnv()).toEqual({
      engine: "mongo",
      url: "mongodb://localhost:27017/wayfinder",
      logger: false,
    });
  });

  it("defaults the query logger to off", () => {
    vi.stubEnv("DATABASE_ENGINE", "sql");
    vi.stubEnv("DATABASE_URL", "file:./test.db");
    vi.stubEnv("DATABASE_LOGGER", "");

    expect(requireDatabaseEnv().logger).toBe(false);
  });

  it("enables the query logger only when DATABASE_LOGGER is exactly \"true\"", () => {
    vi.stubEnv("DATABASE_ENGINE", "sql");
    vi.stubEnv("DATABASE_URL", "file:./test.db");

    vi.stubEnv("DATABASE_LOGGER", "true");
    expect(requireDatabaseEnv().logger).toBe(true);

    vi.stubEnv("DATABASE_LOGGER", "1");
    expect(requireDatabaseEnv().logger).toBe(false);
  });

  it("rejects an unsupported database engine", () => {
    vi.stubEnv("DATABASE_ENGINE", "postgres");
    vi.stubEnv("DATABASE_URL", "postgres://localhost/wayfinder");

    expect(() => requireDatabaseEnv()).toThrow(
      'Invalid DATABASE_ENGINE: postgres. Expected "sql" or "mongo".',
    );
  });

  it("requires a database URL", () => {
    vi.stubEnv("DATABASE_ENGINE", "sql");
    vi.stubEnv("DATABASE_URL", "");

    expect(() => requireDatabaseEnv()).toThrow(
      "Missing required environment variable: DATABASE_URL",
    );
  });
});
