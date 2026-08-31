import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Fraunces, Caveat } from "next/font/google";
import { cookies } from "next/headers";
import AnimatedBackground from "@/components/shared/animated-background";
import { I18nProvider } from "@/lib/i18n/client";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/locales";
import "./globals.css";

const inter = Inter({
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

export const metadata: Metadata = {
  title: "Etsy AI Toolkit",
  description: "One workspace to write listings, posts, and replies for Etsy, Amazon, Shopify, TikTok Shop, and more.",
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
      </head>
      <body className="relative isolate min-h-screen bg-background font-sans text-foreground antialiased">
        <I18nProvider initialLocale={locale}>
          <AnimatedBackground />
          {children}
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
