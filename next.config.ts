import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  turbopack: {
    root: process.cwd(),
  },
  // No `images.remotePatterns` entry for the R2 host is needed: every
  // <Image> that renders a Payload/R2 media URL sets its own `unoptimized`
  // prop instead (see docs/technical/MEDIA_STORAGE.md), which serves the
  // src as-is and never goes through Next's /_next/image optimizer at all —
  // that's deliberate, since routing an R2 image through the optimizer adds
  // back the exact extra Vercel-function hop this whole change avoids on
  // upload. Local static assets (e.g. WayfinderBrand's icon) stay optimized
  // since they don't set `unoptimized`.
};

export default withPayload(nextConfig);
