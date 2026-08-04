import { PayloadSDK } from "@payloadcms/sdk";

// Global Payload REST API client. src/payload-types.ts augments the `payload`
// package's `GeneratedTypes`, so this picks up full collection typing with no
// explicit generic needed. Every feature's services/client/* imports this
// single instance instead of constructing its own.
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const payloadSdk = new PayloadSDK({
  baseURL: `${serverUrl}/api`,
  baseInit: { credentials: "include" },
});
