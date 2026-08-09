import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

/** Excludes private/auth-gated and token-gated single-use paths - nothing there is worth indexing. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/editor",
        "/admin",
        "/api",
        "/invite",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
