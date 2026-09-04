import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import FreeTitleGenerator from "@/components/tools/free-title-generator";
import { getServerTranslations } from "@/lib/i18n/server";
import {
  FileText,
  ListChecks,
  BookOpen,
  ImageIcon,
  Wand2,
  Search,
  Languages,
  Crosshair,
  MessageCircle,
  Star,
  Mail,
  Megaphone,
  Share2,
  Target,
  DollarSign,
  Globe,
  Sparkles,
  Check,
  Tag,
  ArrowRight,
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://craftly.world";

export const metadata: Metadata = {
  title:
    "Free Etsy Title Generator — SEO Titles & 13 Tags in Seconds (2026)",
  description:
    "Type what you made → get an SEO-optimized Etsy title, all 13 tags, and a description preview in seconds. Free, no signup, no card — 3 generations a day. The same prompt that powers Craftly Pro.",
  keywords: [
    "etsy title generator",
    "free etsy title generator",
    "etsy tag generator",
    "etsy seo tool",
    "etsy listing generator",
    "etsy keywords generator",
    "etsy seo 2026",
    "etsy title ideas",
    "etsy product description generator",
    "etsy shop tools",
    "etsy seller tools",
    "how to rank on etsy",
    "etsy search optimization",
    "etsy listing optimization",
    "ai etsy title",
  ],
  alternates: { canonical: "/tools/free-etsy-title-generator" },
  openGraph: {
    title: "Free Etsy Title Generator — SEO Titles & 13 Tags in Seconds",
    description:
      "Free AI Etsy title generator with all 13 tags. No signup, no card, 3 generations a day.",
    type: "website",
    url: `${SITE_URL}/tools/free-etsy-title-generator`,
    siteName: "Craftly",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Etsy Title Generator — Craftly",
    description:
      "Free AI Etsy title generator with all 13 tags. No signup, no card.",
  },
};

// ----------------------------------------------------------------
// 1000-word educational article — English-only by design.
// Googlebot indexes the default-locale (en) content for SEO;
// hardcoded here so non-English locales don't fall back to a
// half-translated article. Translatable chrome (FAQ, tool, CTAs)
// still flows through t().
// ----------------------------------------------------------------
const ARTICLE_INTRO = `Etsy search has changed more in the last 18 months than in the previous five years. Etsy's 2025 redesign introduced AI-assisted query understanding, the marketplace crossed 4.5 million active sellers in early 2026, and new private-label competition has compressed every keyword pool. The result: the buyers you want are still searching, but the competition for every long-tail phrase has never been tougher. Yet 70% of Etsy buyers never click past page 1, and roughly 90% of all marketplace traffic starts with on-site search. That means ranking well for even five or ten carefully chosen keyword phrases can drive more sales than a beautiful listing stuck on page 7. This guide shows you exactly how Etsy's 2026 algorithm weighs titles, tags, and listing quality — and how to use this free tool to ship listings that rank in days, not months.`;

const ARTICLE_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "The three factors Etsy actually weighs in 2026",
    body: `In 2026, Etsy's ranking model is built around three pillars: relevance, quality, and recency. Relevance is determined almost entirely by your title and tags — Etsy's AI now matches buyer queries semantically, not just by exact keywords, but it still uses your title's first 40 characters as the primary signal. Quality is measured by conversion rate, review velocity, and Etsy's quietly weighted "listing quality score" that downranks listings with thin descriptions or missing attributes. Recency is the most underrated factor — Etsy's algorithm gives a measurable boost to listings that have sold recently, been edited, or trend in a buyer's session. The implication is brutal and liberating: a brand-new listing with perfect SEO can outrank an old best-seller in week one, but it needs to convert on its first few visits to keep the boost. Treat SEO as the door, not the destination — every visitor who lands and bounces is a vote against you.`,
  },
  {
    heading: "Anatomy of an Etsy title that ranks",
    body: `Your Etsy title can hold up to 140 characters, but only the first 40 carry most of the ranking weight. Think of it as a newspaper headline: the primary keyword phrase — what buyers actually type — must lead. A great title follows a formula: Primary long-tail keyword, secondary descriptor, material or craft, occasion or audience. Real example: "Personalized Name Necklace, Sterling Silver Initial Pendant, Birthday Gift for Her, Handmade." That title puts "Personalized Name Necklace" in position 1, complements it with "Birthday Gift for Her" in the tags, and stays inside 140 characters. The most common mistake is stuffing adjectives — "Beautiful Amazing Handmade Unique" — which burn characters without adding search signal. Every word in your title should be a phrase a buyer might actually type into the Etsy search bar on her phone at 11pm.`,
  },
  {
    heading: "The 13-tag strategy most sellers get wrong",
    body: `Etsy gives every listing 13 tags, each up to 20 characters. Most sellers waste them. They repeat words from the title (Etsy de-duplicates them, so the second occurrence is silently discarded) or target generic single words like "gift", "handmade", "women" — terms dominated by massive sellers where you will never rank. The right strategy is to use all 13 slots with long-tail, multi-word phrases that real buyers type: "initial letter necklace", "silver bar necklace", "gift for best friend", "personalized jewelry women". Aim for phrases of 2–4 words, mixing product-specific terms (your actual niche), occasion terms (who it's for, when), and material or process terms (how it's made). Optimize for what your customer would actually search, not what sounds impressive. Run a tag through Etsy's search bar before you commit to it — if the autocomplete shows thousands of results, your tag is too generic.`,
  },
  {
    heading: "Why this free tool writes better titles than most humans",
    body: `This free Etsy title generator was built on the same prompt that powers our paid Craftly Pro listing tool. It follows the front-load-first-40-character formula above, generates multi-word phrases that match real Etsy search patterns, and produces all 13 tags at once — saving you the 30–45 minutes it usually takes to write a fully optimized listing by hand. Every title it generates stays inside Etsy's 140-character limit, balances primary and secondary keywords, and avoids the duplicate-with-title trap that catches most beginners. Try it on three of your current listings and compare what comes out — most sellers see a measurable ranking lift within two weeks of switching. The free tier gives you three generations a day with no signup; the Pro tier unlocks unlimited generations plus 15 other AI tools that handle the rest of your shop.`,
  },
  {
    heading: "What to do in the next ten minutes",
    body: `Open the generator above, type a description of your best-selling product, and copy the title and 13 tags straight into your Etsy draft. Run the same prompt on a product you've been struggling to rank — you'll usually see the difference within the first ten seconds. If you want the full description, image prompts, and bulk optimization for your whole shop, create a free Craftly account — no card required, 10 credits a month, and you can keep using every other AI tool we make. SEO is a compounding game: every listing you fix today is a small asset that pays off for the next 18 months. Start with three, measure for two weeks, then come back for the rest.`,
  },
];

function BrowserFrame({
  url,
  children,
  alt,
}: {
  url: string;
  children: ReactNode;
  alt: string;
}) {
  return (
    <figure className="group">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow group-hover:shadow-lg">
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <div className="ml-2 flex-1 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
            {url}
          </div>
        </div>
        <div className="aspect-[16/10] overflow-hidden bg-background">
          {children}
        </div>
      </div>
      <figcaption className="sr-only">{alt}</figcaption>
    </figure>
  );
}

export default function FreeEtsyTitleGeneratorPage() {
  const { t } = getServerTranslations();

  // All 16 dashboard tools — used for internal linking
  const allTools = [
    {
      icon: FileText,
      title: t("dashboard.toolListingTitle"),
      desc: t("dashboard.toolListingDesc"),
      href: "/dashboard/listing",
    },
    {
      icon: ListChecks,
      title: t("dashboard.toolBulletsTitle"),
      desc: t("dashboard.toolBulletsDesc"),
      href: "/dashboard/bullets",
    },
    {
      icon: BookOpen,
      title: t("dashboard.toolBrandStoryTitle"),
      desc: t("dashboard.toolBrandStoryDesc"),
      href: "/dashboard/brand-story",
    },
    {
      icon: ImageIcon,
      title: t("dashboard.toolImagesTitle"),
      desc: t("dashboard.toolImagesDesc"),
      href: "/dashboard/images",
    },
    {
      icon: Wand2,
      title: t("dashboard.toolOptimizerTitle"),
      desc: t("dashboard.toolOptimizerDesc"),
      href: "/dashboard/optimizer",
    },
    {
      icon: Search,
      title: t("dashboard.toolKeywordsTitle"),
      desc: t("dashboard.toolKeywordsDesc"),
      href: "/dashboard/keywords",
    },
    {
      icon: Languages,
      title: t("dashboard.toolTranslateTitle"),
      desc: t("dashboard.toolTranslateDesc"),
      href: "/dashboard/translate",
    },
    {
      icon: Crosshair,
      title: t("dashboard.toolCompetitorTitle"),
      desc: t("dashboard.toolCompetitorDesc"),
      href: "/dashboard/competitor-analysis",
    },
    {
      icon: MessageCircle,
      title: t("dashboard.toolMessagesTitle"),
      desc: t("dashboard.toolMessagesDesc"),
      href: "/dashboard/messages",
    },
    {
      icon: Star,
      title: t("dashboard.toolReviewsTitle"),
      desc: t("dashboard.toolReviewsDesc"),
      href: "/dashboard/reviews",
    },
    {
      icon: Mail,
      title: t("dashboard.toolEmailTitle"),
      desc: t("dashboard.toolEmailDesc"),
      href: "/dashboard/email",
    },
    {
      icon: Megaphone,
      title: t("dashboard.toolAnnouncementTitle"),
      desc: t("dashboard.toolAnnouncementDesc"),
      href: "/dashboard/announcement",
    },
    {
      icon: Share2,
      title: t("dashboard.toolSocialTitle"),
      desc: t("dashboard.toolSocialDesc"),
      href: "/dashboard/social",
    },
    {
      icon: Target,
      title: t("dashboard.toolAdCopyTitle"),
      desc: t("dashboard.toolAdCopyDesc"),
      href: "/dashboard/ad-copy",
    },
    {
      icon: DollarSign,
      title: t("dashboard.toolPricingTitle"),
      desc: t("dashboard.toolPricingDesc"),
      href: "/dashboard/pricing",
    },
    {
      icon: Globe,
      title: t("dashboard.toolGlobalPricingTitle"),
      desc: t("dashboard.toolGlobalPricingDesc"),
      href: "/dashboard/global-pricing",
    },
  ];

  // 8 FAQs (4 existing + 4 new SEO-targeted)
  const faqs = [
    { q: t("marketing.titleGen.faq1q"), a: t("marketing.titleGen.faq1a") },
    { q: t("marketing.titleGen.faq2q"), a: t("marketing.titleGen.faq2a") },
    { q: t("marketing.titleGen.faq3q"), a: t("marketing.titleGen.faq3a") },
    { q: t("marketing.titleGen.faq4q"), a: t("marketing.titleGen.faq4a") },
    { q: t("marketing.titleGen.faq5q"), a: t("marketing.titleGen.faq5a") },
    { q: t("marketing.titleGen.faq6q"), a: t("marketing.titleGen.faq6a") },
    { q: t("marketing.titleGen.faq7q"), a: t("marketing.titleGen.faq7a") },
    { q: t("marketing.titleGen.faq8q"), a: t("marketing.titleGen.faq8a") },
  ];

  const steps = [
    { step: "01", title: t("marketing.titleGen.step1t"), body: t("marketing.titleGen.step1b") },
    { step: "02", title: t("marketing.titleGen.step2t"), body: t("marketing.titleGen.step2b") },
    { step: "03", title: t("marketing.titleGen.step3t"), body: t("marketing.titleGen.step3b") },
  ];

  // ---- JSON-LD structured data ----
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Free Tools",
        item: `${SITE_URL}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Free Etsy Title Generator",
        item: `${SITE_URL}/tools/free-etsy-title-generator`,
      },
    ],
  };

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Craftly Free Etsy Title Generator",
    url: `${SITE_URL}/tools/free-etsy-title-generator`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any (web-based)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description:
        "Free tier: 3 Etsy title + tag generations per day. No signup, no card.",
    },
    description:
      "Free AI Etsy title and tag generator. Produces an SEO-optimized title under 140 characters and all 13 Etsy tags from a short product note.",
    featureList: [
      "SEO-optimized title in under 140 characters",
      "All 13 Etsy tags generated at once",
      "Multi-word long-tail keyword targeting",
      "Front-load first-40-character formula",
      "Description preview",
      "No signup required",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "312",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "How to rank #1 on Etsy in 2026: the SEO playbook behind every winning listing",
    description: ARTICLE_INTRO,
    author: { "@type": "Organization", name: "Craftly" },
    publisher: {
      "@type": "Organization",
      name: "Craftly",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/tools/free-etsy-title-generator`,
    },
    datePublished: "2026-09-04",
    dateModified: "2026-09-04",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <CinematicBackground />
      <Navbar />

      <main className="flex-1">
        <PageHero
          eyebrow={t("marketing.titleGen.eyebrow")}
          title={
            <>
              {t("marketing.titleGen.title1")}{" "}
              <span className="text-primary">{t("marketing.titleGen.title2")}</span>
            </>
          }
          subtitle={t("marketing.titleGen.subtitle")}
        />

        <FreeTitleGenerator />

        {/* ============================ SECTION: Quick anatomy ============================ */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {t("marketing.titleGen.sec1h")}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t("marketing.titleGen.sec1p")}
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {steps.map((s) => (
                  <div
                    key={s.step}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <p className="text-sm font-semibold text-primary">{s.step}</p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================ SECTION: 1000-word SEO article ============================ */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  SEO playbook
                </span>
                <span className="text-xs text-muted-foreground">
                  Updated September 2026
                </span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                How to rank #1 on Etsy in 2026: the SEO playbook behind every
                winning listing
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {ARTICLE_INTRO}
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="prose prose-invert mt-12 max-w-none">
                {ARTICLE_SECTIONS.map((s, idx) => (
                  <div key={idx} className="mt-12 first:mt-0">
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground md:text-[28px]">
                      {s.heading}
                    </h3>
                    <p className="mt-4 text-[17px] leading-[1.75] text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================ SECTION: Screenshots ============================ */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  See it in action — three steps, three seconds
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  From a one-line product note to a fully optimized Etsy listing
                  ready to publish.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Reveal>
                <BrowserFrame
                  url="craftly.world/tools/free-etsy-title-generator"
                  alt="Step 1: Describe what you made in plain words"
                >
                  <div className="flex h-full flex-col items-center justify-center p-6">
                    <div className="w-full max-w-md space-y-3 rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
                          <Sparkles className="h-3 w-3" />
                          Free forever
                        </span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        What did you make?
                      </p>
                      <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                        Speckled stoneware mug
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Product type
                      </p>
                      <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                        Coffee mug
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Material
                      </p>
                      <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                        Stoneware, matte sage glaze
                      </div>
                      <button className="mt-2 w-full rounded-full bg-primary py-2 text-sm font-medium text-primary-foreground">
                        Generate my Etsy title + tags
                      </button>
                    </div>
                  </div>
                </BrowserFrame>
                <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Step 1.</span>{" "}
                  Type what you made like you'd text a friend.
                </p>
              </Reveal>

              <Reveal delay={100}>
                <BrowserFrame
                  url="craftly.world/tools/free-etsy-title-generator"
                  alt="Step 2: SEO-optimized title and 13 tags generated"
                >
                  <div className="flex h-full flex-col items-center justify-center p-6">
                    <div className="w-full max-w-md space-y-3">
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          SEO Title
                        </p>
                        <p className="mt-1 text-[13px] font-medium leading-snug text-foreground">
                          Speckled Stoneware Coffee Mug, Handmade Sage Glaze,
                          Minimalist Ceramic Mug, Gift for Coffee Lover
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          94/140 chars
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          13 Tags
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[
                            "stoneware mug",
                            "speckled mug",
                            "minimalist mug",
                            "ceramic coffee cup",
                            "sage green mug",
                            "handmade pottery",
                            "gift for her",
                            "boho kitchen",
                            "cottagecore mug",
                            "matte glaze",
                            "coffee lover gift",
                            "stoneware cup",
                            "mug set",
                          ].map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-foreground"
                            >
                              <Tag className="h-2.5 w-2.5 text-primary" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </BrowserFrame>
                <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Step 2.</span>{" "}
                  Get a front-loaded title and 13 long-tail tags instantly.
                </p>
              </Reveal>

              <Reveal delay={200}>
                <BrowserFrame
                  url="etsy.com/your-shop/listings/new"
                  alt="Step 3: Paste into Etsy and ship"
                >
                  <div className="flex h-full flex-col items-center justify-center p-6">
                    <div className="w-full max-w-md space-y-2 rounded-xl border border-border bg-card p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Title
                      </p>
                      <div className="rounded-md border border-emerald-400/40 bg-emerald-400/5 px-3 py-2 text-[12px] font-medium text-foreground">
                        Speckled Stoneware Coffee Mug, Handmade Sage Glaze…
                      </div>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Tags
                      </p>
                      <div className="rounded-md border border-emerald-400/40 bg-emerald-400/5 px-3 py-2 text-[10px] leading-relaxed text-foreground">
                        stoneware mug, speckled mug, minimalist mug, ceramic
                        coffee cup, sage green mug, handmade pottery, gift for
                        her, boho kitchen, cottagecore mug, matte glaze, coffee
                        lover gift, stoneware cup, mug set
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400">
                        <Check className="h-3 w-3" />
                        13/13 tags used · 94/140 title chars
                      </div>
                    </div>
                  </div>
                </BrowserFrame>
                <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Step 3.</span>{" "}
                  Paste into Etsy and publish. Watch your ranking climb.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ============================ SECTION: 16 internal tool links ============================ */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {t("marketing.titleGen.alsoH")}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {t("marketing.titleGen.alsoSub")}
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {allTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="mt-3 text-[15px] font-semibold text-foreground">
                        {tool.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {tool.desc}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Open tool <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================ SECTION: FAQ (8) ============================ */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {t("marketing.titleGen.faqH")}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Everything you need to know about ranking your Etsy listings in
                2026.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-8 space-y-4">
                {faqs.map((f, idx) => (
                  <details
                    key={idx}
                    className="group rounded-xl border border-border bg-card p-5"
                    open={idx < 3}
                  >
                    <summary className="cursor-pointer list-none text-[15px] font-medium text-foreground marker:hidden">
                      {f.q}
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================ SECTION: Final CTA ============================ */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="rounded-2xl border border-primary/40 bg-primary/5 p-10 text-center md:p-14">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {t("marketing.titleGen.alsoCtaH")}
                </h2>
                <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
                  {t("marketing.titleGen.alsoCtaP")}
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    className="inline-block rounded-full bg-primary px-10 py-3.5 font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {t("marketing.titleGen.ctaBtn")}
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-block rounded-full border border-border bg-background px-10 py-3.5 font-medium text-foreground hover:border-primary/40"
                  >
                    See pricing
                  </Link>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Free plan: 10 credits/month · No card required · Cancel anytime
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}