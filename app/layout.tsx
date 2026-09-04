import type { Metadata } from "next";
import Script from "next/script";
import { Inter_Tight, Fraunces, Caveat } from "next/font/google";
import { cookies } from "next/headers";
import AnimatedBackground from "@/components/shared/animated-background";
import SiteEffects from "@/components/shared/site-effects";
import PostHogProvider from "@/components/shared/posthog-provider";
import { I18nProvider } from "@/lib/i18n/client";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/locales";
import "./globals.css";

const inter = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://craftly.world";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Craftly — AI tools for e-commerce sellers",
    template: "%s · Craftly",
  },
  description:
    "One workspace to write listings, posts, and replies for Etsy and Shopify. Publish directly via OAuth, or copy-paste anywhere else you sell. Turn product notes into a live listing in one breath.",
  keywords: [
    "Etsy listing generator",
    "Etsy SEO",
    "product description generator",
    "Etsy tools",
    "Shopify tools",
    "Amazon listing",
    "ecommerce AI",
    "product photo generator",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Craftly",
    title: "Craftly — AI tools for e-commerce sellers",
    description:
      "Write listings, posts, and replies for Etsy and Shopify — publish directly, or copy-paste anywhere else you sell.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Craftly — AI tools for e-commerce sellers",
    description:
      "Write listings, posts, and replies for Etsy and Shopify — publish directly, or copy-paste anywhere else you sell.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const langCookie = cookies().get("lang")?.value
  const locale: Locale = isLocale(langCookie) ? langCookie : defaultLocale

  return (
    <html
      lang={locale}
      translate="no"
      className={`notranslate ${inter.variable} ${fraunces.variable} ${caveat.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Craftly",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: siteUrl,
              description:
                "AI tools for e-commerce sellers: write listings, posts, and replies for 10 marketplaces including Etsy, Amazon, Shopify, eBay, TikTok Shop, Temu, and Walmart.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="relative isolate min-h-screen bg-background font-sans text-foreground antialiased">
        <I18nProvider initialLocale={locale}>
          <AnimatedBackground />
          <SiteEffects />
          <PostHogProvider>{children}</PostHogProvider>
        </I18nProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
