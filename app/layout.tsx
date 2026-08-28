import type { Metadata } from "next";
import { Inter, Playfair_Display, Caveat, Instrument_Serif, Barlow, JetBrains_Mono } from "next/font/google";
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

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-barlow",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Etsy Seller AI Toolkit",
  description: "AI-powered tools for Etsy sellers to create listings, reply to customers, and grow their shop.",
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
      className={`notranslate ${inter.variable} ${playfair.variable} ${caveat.variable} ${instrumentSerif.variable} ${barlow.variable} ${jetbrainsMono.variable}`}
    >
      <body className="relative isolate min-h-screen bg-white font-sans text-foreground antialiased">
        <I18nProvider initialLocale={locale}>
          <AnimatedBackground />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
