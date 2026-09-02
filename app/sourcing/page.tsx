import type { Metadata } from "next";
import SourcingHeader from "@/components/sourcing/sourcing-header";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import Reveal from "@/components/shared/reveal";
import SourcingQuoteForm from "@/components/sourcing/sourcing-quote-form";
import { getServerTranslations } from "@/lib/i18n/server";
import {
  PackageSearch,
  Handshake,
  ShieldCheck,
  Truck,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Craftly Sourcing — Verified Chinese Suppliers",
  description:
    "Source products from verified Chinese suppliers. We find factories, negotiate prices, inspect quality, and ship to your door.",
};

export default function SourcingPage() {
  const { t } = getServerTranslations();

  const steps = [
    {
      icon: PackageSearch,
      title: t("marketing.sourcing.step1t"),
      desc: t("marketing.sourcing.step1"),
    },
    {
      icon: Handshake,
      title: t("marketing.sourcing.step2t"),
      desc: t("marketing.sourcing.step2"),
    },
    {
      icon: ShieldCheck,
      title: t("marketing.sourcing.step3t"),
      desc: t("marketing.sourcing.step3"),
    },
    {
      icon: Truck,
      title: t("marketing.sourcing.step4t"),
      desc: t("marketing.sourcing.step4"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <SourcingHeader />
      <main className="flex-1">
        <PageHero
          eyebrow={t("marketing.sourcing.eyebrow")}
          title={
            <>
              {t("marketing.sourcing.title1")}{" "}
              <span className="grad">{t("marketing.sourcing.title2")}</span>
            </>
          }
          subtitle={t("marketing.sourcing.subtitle")}
        />

        {/* How it works */}
        <section id="how" className="px-5 pb-20 md:pb-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="mb-4 text-[13px] uppercase tracking-[0.2em] text-primary">
                {t("marketing.sourcing.how")}
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="max-w-2xl font-sans text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
                {t("marketing.sourcing.howTitle")}
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 60} className="h-full">
                  <div className="flex h-full flex-col rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-colors hover:border-primary/40">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <step.icon className="h-5 w-5 text-primary" />
                    </span>
                    <h3 className="mt-4 font-sans text-lg font-extrabold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-border px-5 py-20 md:py-28">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <p className="mb-4 text-[13px] uppercase tracking-[0.2em] text-primary">
                {t("marketing.sourcing.pricing")}
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="font-sans text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
                {t("marketing.sourcing.pricingTitle")}
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card/60 p-6">
                  <h3 className="font-sans text-lg font-extrabold text-foreground">{t("marketing.sourcing.p1t")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t("marketing.sourcing.p1")}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-6">
                  <h3 className="font-sans text-lg font-extrabold text-foreground">{t("marketing.sourcing.p2t")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t("marketing.sourcing.p2")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Trust */}
        <section id="trust" className="border-t border-border px-5 py-20 md:py-28">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <p className="mb-4 text-[13px] uppercase tracking-[0.2em] text-primary">
                {t("marketing.sourcing.trust")}
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="font-sans text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
                {t("marketing.sourcing.trustTitle")}
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-6">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  {t("marketing.sourcing.trustBody")}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Quote form */}
        <section id="quote" className="border-t border-border px-5 pb-28 pt-20 md:pb-36">
          <div className="mx-auto max-w-xl">
            <Reveal>
              <h2 className="mb-2 text-center font-sans text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
                {t("marketing.sourcing.quoteTitle")}
              </h2>
            </Reveal>
            <Reveal delay={60}>
              <p className="mb-8 text-center text-muted-foreground">
                {t("marketing.sourcing.quoteBody")}
              </p>
            </Reveal>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8">
              <SourcingQuoteForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
