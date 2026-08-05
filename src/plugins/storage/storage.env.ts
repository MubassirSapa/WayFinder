// Unlike requireDatabaseEnv/requireResendEnv, R2 is optional: local dev and
// CI should keep working on Payload's default local-disk storage when these
// aren't set, so this reads without throwing and reports whether R2 is
// actually configured instead.
export function getR2Env() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  const endpoint = process.env.R2_ENDPOINT;

  const enabled = Boolean(accessKeyId && secretAccessKey && bucket && publicUrl && endpoint);

  return {
    enabled,
    accessKeyId: accessKeyId ?? "",
    secretAccessKey: secretAccessKey ?? "",
    bucket: bucket ?? "",
    publicUrl: publicUrl ?? "",
    endpoint: endpoint ?? "",
  };
}
