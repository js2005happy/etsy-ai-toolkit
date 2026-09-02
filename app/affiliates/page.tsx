import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import { ArrowRight, Link2, Percent, Wallet } from "lucide-react";
import { getServerTranslations } from "@/lib/i18n/server";

export default function AffiliatesPage() {
  const { t } = getServerTranslations();

  const steps = [
    {
      icon: Link2,
      title: t("marketing.affiliates.step1t"),
      body: t("marketing.affiliates.step1"),
    },
    {
      icon: ArrowRight,
      title: t("marketing.affiliates.step2t"),
      body: t("marketing.affiliates.step2"),
    },
    {
      icon: Wallet,
      title: t("marketing.affiliates.step3t"),
      body: t("marketing.affiliates.step3"),
    },
  ];

  const perks = [
    {
      title: t("marketing.affiliates.p1t"),
      body: t("marketing.affiliates.p1"),
    },
    {
      title: t("marketing.affiliates.p2t"),
      body: t("marketing.affiliates.p2"),
    },
    {
      title: t("marketing.affiliates.p3t"),
      body: t("marketing.affiliates.p3"),
    },
    {
      title: t("marketing.affiliates.p4t"),
      body: t("marketing.affiliates.p4"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow={t("marketing.affiliates.eyebrow")}
          title={
            <>
              {t("marketing.affiliates.title1")} <span className="serif-accent grad">{t("marketing.affiliates.title2")}</span>{" "}
              {t("marketing.affiliates.title3")}
            </>
          }
          subtitle={t("marketing.affiliates.subtitle")}
        />

        <section className="px-5 pb-16">
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <s.icon className="mb-4 h-6 w-6 text-primary" />
                  <h3 className="font-sans text-lg font-extrabold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="px-5 pb-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center font-sans text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              {t("marketing.affiliates.why")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {perks.map((p, i) => (
                <Reveal key={p.title} delay={i * 50}>
                  <div className="h-full rounded-2xl border border-border bg-card p-6">
                    <h3 className="font-sans text-lg font-extrabold text-foreground">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-28 md:pb-36">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
            <Percent className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="font-sans text-2xl font-extrabold text-foreground">{t("marketing.affiliates.ctaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("marketing.affiliates.ctaBody")}
            </p>
            <a
              href="mailto:js2005happy@gmail.com?subject=Etsy%20AI%20Toolkit%20affiliate%20program"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("marketing.affiliates.cta")}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
