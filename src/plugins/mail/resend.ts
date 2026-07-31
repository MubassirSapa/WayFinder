import { resendAdapter } from "@payloadcms/email-resend";
import { requireResendEnv } from "./resend.env";

const resendEnv = requireResendEnv();

export const resendEmailAdapter = resendAdapter({
  apiKey: resendEnv.apiKey,
  defaultFromAddress: resendEnv.fromAddress,
  defaultFromName: resendEnv.fromName,
});
