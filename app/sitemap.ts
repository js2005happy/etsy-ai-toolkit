import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://craftly.world";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/pricing",
    "/contact",
    "/faq",
    "/affiliates",
    "/terms",
    "/privacy",
    "/refund",
    "/login",
    "/signup",
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  // SEO-targeted landing page — boosted priority + weekly cadence.
  const toolEntry: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/tools/free-etsy-title-generator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  return [...staticEntries, ...toolEntry];
}
