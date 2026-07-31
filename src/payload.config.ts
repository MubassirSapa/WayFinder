import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { collections, Users } from "./collections/index";
import { requireEnv } from "./lib/env";
import { databaseAdapter } from "./plugins/database/database";
import { resendEmailAdapter } from "./plugins/mail/resend";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections,
  email: resendEmailAdapter,
  editor: lexicalEditor(),
  secret: requireEnv("PAYLOAD_SECRET"),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: databaseAdapter,
  sharp,
  plugins: [],
});
