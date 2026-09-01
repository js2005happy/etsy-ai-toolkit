import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://craftly.world";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/account", "/api/", "/auth/", "/welcome"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
