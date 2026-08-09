import type { MetadataRoute } from "next";

import { PUBLIC_ROUTES } from "@/constants/routes";
import { getPublicLandingData } from "@/features/viewer/services/getPublicLandingData";

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

/** Without this, Next.js prerenders the sitemap once at build time and newly published floors go missing until the next deploy. */
export const revalidate = 3600;

/** Reuses the home/buildings pages' own public data source (see docs/technical/CACHING_AND_RENDERING_STRATEGY.md) so every published floor is discoverable. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { venues } = await getPublicLandingData();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}${PUBLIC_ROUTES.HOME}`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}${PUBLIC_ROUTES.BUILDINGS}`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}${PUBLIC_ROUTES.ABOUT}`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}${PUBLIC_ROUTES.ORGANIZATION}`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}${PUBLIC_ROUTES.ORGANIZATION_ABOUT}`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}${PUBLIC_ROUTES.TERMS}`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}${PUBLIC_ROUTES.PRIVACY}`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const floorRoutes: MetadataRoute.Sitemap = venues.flatMap((venue) =>
    venue.floors.map((floor) => ({
      url: `${BASE_URL}${floor.href}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );

  return [...staticRoutes, ...floorRoutes];
}
