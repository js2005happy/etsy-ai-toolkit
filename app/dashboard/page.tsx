import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageCircle, Share2, Star, Megaphone, Search, Languages, Wand2, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining")
    .eq("id", user.id)
    .single();

  const credits = profile?.credits_remaining ?? 10;
  const percent = Math.max(0, Math.min(100, (credits / 10) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-50">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-stone-900 md:text-4xl">Welcome back!</h1>
          <p className="mt-2 text-stone-600">Manage your AI-powered Etsy tools and credits.</p>
        </div>

        <Card className="mb-8 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold text-stone-700">Your Credits</CardTitle>
            <CardDescription className="mt-1">Remaining generations this month</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold text-amber-600">{credits}</span>
              <span className="text-sm text-stone-500">/ 10</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-stone-200">
              <div className="h-2 rounded-full bg-amber-500" style={{ width: `${percent}%` }} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <CardHeader className="p-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Listing Generator</CardTitle>
              <CardDescription className="mt-2 text-sm text-stone-600">Create SEO-optimized titles, descriptions, and tags.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <Link href="/dashboard/listing"><Button className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">Open Tool</Button></Link>
            </CardContent>
          </Card>

          <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <CardHeader className="p-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <MessageCircle className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Message Assistant</CardTitle>
              <CardDescription className="mt-2 text-sm text-stone-600">Generate professional replies to customer inquiries.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <Link href="/dashboard/messages"><Button className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">Open Tool</Button></Link>
            </CardContent>
          </Card>

          <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <CardHeader className="p-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Share2 className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Social Media Posts</CardTitle>
              <CardDescription className="mt-2 text-sm text-stone-600">Create captions and hashtags for Instagram, Pinterest, TikTok.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <Link href="/dashboard/social"><Button className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">Open Tool</Button></Link>
            </CardContent>
          </Card>

          <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <CardHeader className="p-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Review Reply Assistant</CardTitle>
              <CardDescription className="mt-2 text-sm text-stone-600">Respond professionally to customer reviews.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <Link href="/dashboard/reviews"><Button className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">Open Tool</Button></Link>
            </CardContent>
          </Card>

          <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <CardHeader className="p-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Megaphone className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Announcement Generator</CardTitle>
              <CardDescription className="mt-2 text-sm text-stone-600">Create welcome, promo, or about us text.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <Link href="/dashboard/announcement"><Button className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">Open Tool</Button></Link>
            </CardContent>
          </Card>

          <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <CardHeader className="p-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Search className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Keyword Research</CardTitle>
              <CardDescription className="mt-2 text-sm text-stone-600">Find high-search-volume keywords for your products.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <Link href="/dashboard/keywords"><Button className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">Open Tool</Button></Link>
            </CardContent>
          </Card>

          <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <CardHeader className="p-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Languages className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Listing Translator</CardTitle>
              <CardDescription className="mt-2 text-sm text-stone-600">Translate your listing into multiple languages.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <Link href="/dashboard/translate"><Button className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">Open Tool</Button></Link>
            </CardContent>
          </Card>

          <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <CardHeader className="p-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Wand2 className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Listing Optimizer</CardTitle>
              <CardDescription className="mt-2 text-sm text-stone-600">Improve your existing listing for better SEO.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <Link href="/dashboard/optimizer"><Button className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">Open Tool</Button></Link>
            </CardContent>
          </Card>

          <Card className="card-hover rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <CardHeader className="p-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Pricing Advisor</CardTitle>
              <CardDescription className="mt-2 text-sm text-stone-600">Get suggested price and profit analysis.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <Link href="/dashboard/pricing"><Button className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">Open Tool</Button></Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}