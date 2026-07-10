import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["badge-arcade-donna-commercial.trycloudflare.com"],
};

export default withPayload(nextConfig);
