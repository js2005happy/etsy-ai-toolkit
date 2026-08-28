import type { Metadata } from "next";
import { Inter, Playfair_Display, Caveat } from "next/font/google";
import AnimatedBackground from "@/components/shared/animated-background";
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

export const metadata: Metadata = {
  title: "Etsy Seller AI Toolkit",
  description: "AI-powered tools for Etsy sellers to create listings, reply to customers, and grow their shop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${caveat.variable}`}>
      <body className="relative isolate min-h-screen bg-white font-sans text-foreground antialiased">
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
