import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageCircle, Share2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-100 to-stone-50" />
          <div className="absolute left-1/2 top-1/3 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 md:text-6xl">
              Supercharge Your <span className="text-amber-600">Etsy Shop</span> with AI
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
              Create SEO-optimized listings, reply to customers, and generate social media posts in seconds.
              Save hours of work and boost your sales with AI-powered tools.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="rounded-full bg-amber-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-amber-700">
                  Get Started Free
                </Button>
              </Link>
              <Link href="#tools">
                <Button size="lg" variant="outline" className="rounded-full border-stone-300 px-8 py-3 text-base font-semibold text-stone-700 hover:bg-stone-100">
                  View Tools
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section id="tools" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-stone-900 md:text-4xl">Powerful Tools for Sellers</h2>
            <p className="mx-auto mt-4 max-w-2xl text-stone-600">
              Everything you need to grow your Etsy business, powered by the latest AI models.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <CardHeader className="p-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-xl font-semibold">Listing Generator</CardTitle>
                <CardDescription className="mt-2 text-sm text-stone-600">
                  Turn basic product info into high-converting SEO titles and descriptions that rank on Etsy.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 mt-4">
                <Link href="/dashboard/listing" className="text-sm font-medium text-amber-600 hover:text-amber-700">
                  Learn more -
                </Link>
              </CardContent>
            </Card>
            {/* Card 2 */}
            <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <CardHeader className="p-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <MessageCircle className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-xl font-semibold">Message Assistant</CardTitle>
                <CardDescription className="mt-2 text-sm text-stone-600">
                  Draft professional, friendly, and empathetic replies in seconds to keep your ratings high.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 mt-4">
                <Link href="/dashboard/messages" className="text-sm font-medium text-amber-600 hover:text-amber-700">
                  Learn more -
                </Link>
              </CardContent>
            </Card>
            {/* Card 3 */}
            <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <CardHeader className="p-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Share2 className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-xl font-semibold">Social Media Posts</CardTitle>
                <CardDescription className="mt-2 text-sm text-stone-600">
                  Create viral-ready captions and hashtags for Instagram, Pinterest, and TikTok to drive more traffic.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 mt-4">
                <Link href="/dashboard/social" className="text-sm font-medium text-amber-600 hover:text-amber-700">
                  Learn more -
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-stone-900 md:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mx-auto mt-4 max-w-2xl text-stone-600">Start free and upgrade as your shop grows.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            <Card className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
              <CardHeader className="p-0">
                <CardTitle className="text-xl font-semibold">Free</CardTitle>
                <CardDescription className="mt-1">$0 / month</CardDescription>
              </CardHeader>
              <CardContent className="p-0 mt-6 space-y-2 text-sm text-stone-600">
                <p>- 10 credits per month</p>
                <p>- Access to all AI tools</p>
                <Link href="/signup">
                  <Button className="mt-4 w-full rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200">Start Free</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 border-amber-500 bg-white p-8 shadow-md">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Pro</CardTitle>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Popular</span>
                </div>
                <CardDescription className="mt-1">$19 / month</CardDescription>
              </CardHeader>
              <CardContent className="p-0 mt-6 space-y-2 text-sm text-stone-600">
                <p>- Unlimited credits</p>
                <p>- Priority AI processing</p>
                <p>- Advanced SEO templates</p>
                <Link href="/signup">
                  <Button className="mt-4 w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">Upgrade to Pro</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-500">
          (c) 2026 Etsy Seller AI Toolkit. Not affiliated with Etsy, Inc.
        </div>
      </footer>
    </div>
  );
}