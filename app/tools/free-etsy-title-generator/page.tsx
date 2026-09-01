import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import FreeTitleGenerator from "@/components/tools/free-title-generator";

export const metadata: Metadata = {
  title: "Free Etsy Title Generator — SEO Titles & 13 Tags in Seconds | Craftly",
  description:
    "Describe what you made in plain words and get an SEO-optimized Etsy title, all 13 tags, and a description preview instantly. Free, no signup, no card — 3 generations a day.",
  keywords: [
    "etsy title generator",
    "free etsy title generator",
    "etsy tag generator",
    "etsy seo tool",
    "etsy listing generator",
    "etsy keywords",
  ],
  alternates: { canonical: "/tools/free-etsy-title-generator" },
  openGraph: {
    title: "Free Etsy Title Generator — Craftly",
    description:
      "Turn product notes into an SEO-optimized Etsy title, 13 tags, and a description preview. Free, no signup.",
    type: "website",
  },
};

const faqs = [
  {
    q: "Is this Etsy title generator really free?",
    a: "Yes. You get 3 free generations per day with no account, no card, and no email. The full Craftly toolkit (15 tools across Etsy, Amazon, TikTok Shop, and 7 more marketplaces) has a free plan with 10 credits per month.",
  },
  {
    q: "What makes a good Etsy title?",
    a: "Etsy weighs the first ~40 characters of your title most heavily in search. Front-load your strongest long-tail keyword phrase, stay under 140 characters, describe material and craft, and skip filler words like 'beautiful' or 'amazing' — buyers search specifics, not adjectives.",
  },
  {
    q: "How do the 13 tags work?",
    a: "Etsy gives every listing 13 tags, each up to 20 characters. Multi-word phrases buyers actually type (like 'personalized name necklace') beat single generic words ('necklace') — long-tail tags put you in smaller, more winnable search pools.",
  },
  {
    q: "Is this tool affiliated with Etsy?",
    a: "No. Craftly is an independent product and is not affiliated with or endorsed by Etsy, Inc.",
  },
];

export default function FreeEtsyTitleGeneratorPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Free tool"
          title={
            <>
              Free Etsy Title <span className="text-primary">Generator</span>
            </>
          }
          subtitle="Describe what you made in plain words. Get an SEO-optimized title, all 13 tags, and a description preview — instantly, no signup."
        />

        <FreeTitleGenerator />

        <section className="px-5 pb-24">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Why your first 40 characters decide everything
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Etsy&apos;s search algorithm reads your title from the left. The
                keyword phrase you place in the first ~40 characters is what
                your listing actually competes on — bury your main keyword at
                position 80 and it may as well not be there. Every title this
                generator writes puts your strongest long-tail phrase up
                front, stays within Etsy&apos;s 140-character limit, and pairs
                it with 13 multi-word tags (max 20 characters each) that drop
                you into winnable search pools instead of oceans of
                single-word competition.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Describe",
                    body: "Type what you made like you'd text a friend. Material, style, what it is — no prompt engineering.",
                  },
                  {
                    step: "02",
                    title: "Generate",
                    body: "Get a front-loaded SEO title, 13 buyer-searched tags, and a description preview in seconds.",
                  },
                  {
                    step: "03",
                    title: "Publish",
                    body: "Copy, paste into Etsy, and get back to the workbench. Sign up free to unlock the full description.",
                  },
                ].map((s) => (
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

            <Reveal delay={160}>
              <h2 className="mt-24 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Frequently asked questions
              </h2>
              <div className="mt-6 space-y-4">
                {faqs.map((f) => (
                  <details
                    key={f.q}
                    className="group rounded-xl border border-border bg-card p-5"
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

            <Reveal delay={200}>
              <div className="mt-24 rounded-2xl border border-primary/40 bg-primary/5 p-10 text-center md:p-14">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  The words take care of themselves.
                </h2>
                <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
                  Craftly turns product notes into listings, buyer replies,
                  social posts, and product images — for Etsy, Amazon, TikTok
                  Shop, and 7 more marketplaces. Begin free. No card required.
                </p>
                <Link
                  href="/signup"
                  className="mt-8 inline-block rounded-full bg-primary px-10 py-3.5 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Start for free
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
