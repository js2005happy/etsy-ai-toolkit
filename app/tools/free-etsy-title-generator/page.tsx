import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import FreeTitleGenerator from "@/components/tools/free-title-generator";
import { getServerTranslations } from "@/lib/i18n/server";

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

export default function FreeEtsyTitleGeneratorPage() {
  const { t } = getServerTranslations();

  const faqs = [
    {
      q: t("marketing.titleGen.faq1q"),
      a: t("marketing.titleGen.faq1a"),
    },
    {
      q: t("marketing.titleGen.faq2q"),
      a: t("marketing.titleGen.faq2a"),
    },
    {
      q: t("marketing.titleGen.faq3q"),
      a: t("marketing.titleGen.faq3a"),
    },
    {
      q: t("marketing.titleGen.faq4q"),
      a: t("marketing.titleGen.faq4a"),
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const steps = [
    { step: "01", title: t("marketing.titleGen.step1t"), body: t("marketing.titleGen.step1b") },
    { step: "02", title: t("marketing.titleGen.step2t"), body: t("marketing.titleGen.step2b") },
    { step: "03", title: t("marketing.titleGen.step3t"), body: t("marketing.titleGen.step3b") },
  ];

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

            <Reveal delay={160}>
              <h2 className="mt-24 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {t("marketing.titleGen.faqH")}
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
                  {t("marketing.titleGen.ctaH")}
                </h2>
                <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
                  {t("marketing.titleGen.ctaP")}
                </p>
                <Link
                  href="/signup"
                  className="mt-8 inline-block rounded-full bg-primary px-10 py-3.5 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {t("marketing.titleGen.ctaBtn")}
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
