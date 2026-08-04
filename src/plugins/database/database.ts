import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { sqliteAdapter } from "@payloadcms/db-sqlite";

import { requireDatabaseEnv } from "./database.env";

const databaseEnv = requireDatabaseEnv();

export const databaseAdapter =
  databaseEnv.engine === "mongo"
    ? mongooseAdapter({ url: databaseEnv.url })
    : sqliteAdapter({ client: { url: databaseEnv.url } });
