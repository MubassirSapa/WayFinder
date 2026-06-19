import { requireEnv } from "@/lib/env";

export function requireResendEnv() {
  return {
    apiKey: requireEnv("RESEND_API_KEY"),
    fromAddress: requireEnv("RESEND_FROM_ADDRESS"),
    fromName: process.env.RESEND_FROM_NAME || "Wayfinder",
  };
}
