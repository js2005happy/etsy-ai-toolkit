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
    "/tools",
    "/how-it-works",
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const toolEntry: MetadataRoute.Sitemap = ["free-etsy-title-generator"].map((slug) => ({
    url: `${siteUrl}/tools/${slug}`,
    lastModified: new Date(), changeFrequency: "weekly", priority: 0.9,
  }));

  return [...staticEntries, ...toolEntry];
}
