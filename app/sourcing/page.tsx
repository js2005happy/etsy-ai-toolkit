import type { Metadata } from "next";
import SourcingHeader from "@/components/sourcing/sourcing-header";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import Reveal from "@/components/shared/reveal";
import SourcingQuoteForm from "@/components/sourcing/sourcing-quote-form";
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

const steps = [
  {
    icon: PackageSearch,
    title: "Tell us what you need",
    desc: "Share your product idea, specs, or a link to something you want to source. No technical knowledge needed.",
  },
  {
    icon: Handshake,
    title: "We find & negotiate",
    desc: "Our team sources verified factories, gets samples, and negotiates the best price on your behalf.",
  },
  {
    icon: ShieldCheck,
    title: "Quality check & sampling",
    desc: "We inspect samples before mass production, so you never ship a bad batch to your customers.",
  },
  {
    icon: Truck,
    title: "Consolidate & ship",
    desc: "We consolidate your orders, handle freight and customs, and deliver to your warehouse or door.",
  },
];

export default function SourcingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <SourcingHeader />
      <main className="flex-1">
        <PageHero
          eyebrow="Sourcing"
          title={
            <>
              Source from China,{" "}
              <span className="text-primary">without the guesswork</span>
            </>
          }
          subtitle="We find, negotiate, and ship products from verified Chinese suppliers — so you can sell with confidence, even if you've never imported before."
        />

        {/* How it works */}
        <section id="how" className="px-5 pb-20 md:pb-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="mb-4 text-[13px] uppercase tracking-[0.2em] text-primary">
                How it works
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
                Four steps from idea to your warehouse
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 60} className="h-full">
                  <div className="flex h-full flex-col rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-colors hover:border-primary/40">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <step.icon className="h-5 w-5 text-primary" />
                    </span>
                    <h3 className="mt-4 font-display text-lg text-foreground">{step.title}</h3>
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
                Pricing
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
                Transparent pricing, no hidden costs
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card/60 p-6">
                  <h3 className="font-display text-lg text-foreground">Commission model</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    A 5–10% sourcing fee on the order value. You only pay when you place the order.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-6">
                  <h3 className="font-display text-lg text-foreground">Flat project fee</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    For complex or one-off projects, we quote a fixed fee upfront after understanding your scope.
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
                Why trust us
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
                Direct factory access, real QC
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-6">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  We&apos;re based in China and work with a network of verified factories.
                  We visit suppliers, inspect samples, and handle quality control before anything
                  ships — so the biggest risk of importing (getting a bad batch) is covered.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Quote form */}
        <section id="quote" className="border-t border-border px-5 pb-28 pt-20 md:pb-36">
          <div className="mx-auto max-w-xl">
            <Reveal>
              <h2 className="mb-2 text-center font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
                Get a quote
              </h2>
            </Reveal>
            <Reveal delay={60}>
              <p className="mb-8 text-center text-muted-foreground">
                Tell us what you want to source — we&apos;ll get back within 24 hours.
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
