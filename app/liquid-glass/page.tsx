import type { Metadata } from "next";
import {
  ArrowUpRight,
  Play,
  Zap,
  Palette,
  BarChart3,
  Shield,
} from "lucide-react";
import Reveal from "@/components/shared/reveal";
import AuroraGlow from "@/components/liquid-glass/aurora-glow";
import BlurText from "@/components/liquid-glass/blur-text";

export const metadata: Metadata = {
  title: "Liquid Glass — AI Web Design Agency",
  description: "Stunning design. Blazing performance. Built by AI, refined by experts.",
};

const navLinks = ["Home", "Services", "Work", "Process", "Pricing"];

const featureRows = [
  {
    title: "Designed to convert. Built to perform.",
    desc: "Every pixel is intentional. Our AI studies what works across thousands of top sites—then builds yours to outperform them all.",
    cta: "Learn more",
  },
  {
    title: "It gets smarter. Automatically.",
    desc: "Your site evolves on its own. AI monitors every click, scroll, and conversion—then optimizes in real time. No manual updates. Ever.",
    cta: "See how it works",
  },
];

const featureCards = [
  { icon: Zap, title: "Days, Not Months", desc: "Concept to launch at a pace that redefines fast." },
  { icon: Palette, title: "Obsessively Crafted", desc: "Every detail considered. Every element refined." },
  { icon: BarChart3, title: "Built to Convert", desc: "Layouts informed by data. Decisions backed by performance." },
  { icon: Shield, title: "Secure by Default", desc: "Enterprise-grade protection comes standard." },
];

const stats = [
  { value: "200+", label: "Sites launched" },
  { value: "98%", label: "Client satisfaction" },
  { value: "3.2x", label: "More conversions" },
  { value: "5 days", label: "Average delivery" },
];

const testimonials = [
  {
    quote: "A complete rebuild in five days. The new site feels like it was crafted by a full team of designers.",
    name: "Sarah Chen",
    role: "CEO, Luminary",
  },
  {
    quote: "Conversions up 4x within the first month. The AI-optimized layout outperformed everything we tried before.",
    name: "Marcus Webb",
    role: "Head of Growth, Arcline",
  },
  {
    quote: "They didn't just design our site—they reimagined our entire brand presence. Impeccable craft.",
    name: "Elena Voss",
    role: "Brand Director, Helix",
  },
];

export default function LiquidGlassPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black font-barlow text-white">
      {/* NAVBAR */}
      <header className="fixed left-0 right-0 top-4 z-50 px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full font-heading text-lg italic text-white">
            LG
          </div>
          <nav className="liquid-glass hidden items-center gap-1 rounded-full px-2 py-1.5 md:flex">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                {link}
              </a>
            ))}
            <a
              href="#"
              className="ml-2 flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-105"
            >
              Get Started
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative h-[1000px] overflow-visible">
        <AuroraGlow variant="teal" />
        <div className="absolute inset-0 z-0 bg-black/5" />
        <div className="absolute bottom-0 left-0 right-0 z-[1] h-[300px] bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 flex flex-col items-center px-6 pt-[150px] text-center">
          <div className="liquid-glass mb-6 flex items-center gap-2 rounded-full px-3 py-1">
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-black">New</span>
            <span className="text-xs font-medium text-white">Introducing AI-powered web design.</span>
          </div>

          <h1 className="max-w-4xl font-heading text-6xl italic leading-[0.8] tracking-[-4px] md:text-7xl lg:text-[5.5rem]">
            <BlurText text="The Website Your Brand Deserves" />
          </h1>

          <p className="mt-8 max-w-2xl text-sm font-light text-white/60 md:text-base">
            Stunning design. Blazing performance. Built by AI, refined by experts. This is web design,
            wildly reimagined.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <a
              href="#"
              className="liquid-glass-strong flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform hover:scale-105"
            >
              Get Started
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href="#" className="flex items-center gap-2 text-sm font-light text-white/80 transition-colors hover:text-white">
              <Play className="h-4 w-4" />
              Watch the Film
            </a>
          </div>
        </div>
      </section>

      {/* PARTNERS BAR */}
      <section className="px-6 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">
          <span className="liquid-glass rounded-full px-4 py-1.5 text-xs font-medium text-white">
            Trusted by the teams behind
          </span>
          <div className="flex flex-wrap items-center justify-center gap-12">
            {["Stripe", "Vercel", "Linear", "Notion", "Figma"].map((name) => (
              <span key={name} className="font-heading text-2xl italic text-white md:text-3xl">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative min-h-[700px] overflow-hidden px-6 py-32 md:px-16 lg:px-24">
        <AuroraGlow variant="teal" />
        <div className="absolute inset-x-0 top-0 z-[1] h-[200px] bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-[1] h-[200px] bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[500px] max-w-4xl flex-col items-center justify-center text-center">
          <Reveal>
            <span className="liquid-glass mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-medium text-white">
              How It Works
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-heading text-4xl italic leading-[0.9] tracking-tight md:text-5xl lg:text-6xl">
              You dream it. We ship it.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-sm font-light text-white/60 md:text-base">
              Share your vision. Our AI handles the rest—wireframes, design, code, launch. All in days,
              not quarters.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <a
              href="#"
              className="liquid-glass-strong mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform hover:scale-105"
            >
              Get Started
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* FEATURES CHESS */}
      <section className="px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <Reveal>
              <span className="liquid-glass mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-medium text-white">
                Capabilities
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-heading text-4xl italic leading-[0.9] tracking-tight md:text-5xl lg:text-6xl">
                Pro features. Zero complexity.
              </h2>
            </Reveal>
          </div>

          <div className="space-y-24">
            {featureRows.map((row, i) => (
              <div
                key={row.title}
                className={`grid items-center gap-12 lg:grid-cols-2 ${
                  i % 2 === 1 ? "lg:[direction:rtl]" : ""
                }`}
              >
                <div className="lg:[direction:ltr]">
                  <Reveal>
                    <h3 className="font-heading text-3xl italic leading-[1.05] tracking-tight md:text-4xl">
                      {row.title}
                    </h3>
                    <p className="mt-5 text-sm font-light text-white/60 md:text-base">{row.desc}</p>
                    <a
                      href="#"
                      className="liquid-glass-strong mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform hover:scale-105"
                    >
                      {row.cta}
                    </a>
                  </Reveal>
                </div>
                <div className="lg:[direction:ltr]">
                  <Reveal delay={100}>
                    <div className="liquid-glass flex aspect-[4/3] items-center justify-center rounded-2xl">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
                        <span className="font-heading text-3xl italic">LG</span>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Reveal>
              <span className="liquid-glass mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-medium text-white">
                Why Us
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-heading text-4xl italic leading-[0.9] tracking-tight md:text-5xl lg:text-6xl">
                The difference is everything.
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 80} className="h-full">
                <div className="liquid-glass flex h-full flex-col rounded-2xl p-6">
                  <div className="liquid-glass-strong mb-5 flex h-10 w-10 items-center justify-center rounded-full">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-lg italic text-white">{card.title}</h3>
                  <p className="mt-2 text-sm font-light text-white/60">{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative overflow-hidden px-6 py-32">
        <AuroraGlow variant="slate" />
        <div className="absolute inset-x-0 top-0 z-[1] h-[200px] bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-[1] h-[200px] bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <Reveal>
            <div className="liquid-glass grid grid-cols-2 gap-8 rounded-3xl p-12 text-center md:p-16 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-heading text-4xl italic text-white md:text-5xl lg:text-6xl">
                    {s.value}
                  </div>
                  <div className="mt-2 text-sm font-light text-white/60">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Reveal>
              <span className="liquid-glass mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-medium text-white">
                What They Say
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-heading text-4xl italic leading-[0.9] tracking-tight md:text-5xl lg:text-6xl">
                Don&apos;t take our word for it.
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 80} className="h-full">
                <div className="liquid-glass flex h-full flex-col rounded-2xl p-8">
                  <p className="text-sm font-light italic text-white/80">&quot;{t.quote}&quot;</p>
                  <div className="mt-6">
                    <div className="text-sm font-medium text-white">{t.name}</div>
                    <div className="text-xs font-light text-white/50">{t.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="relative overflow-hidden px-6">
        <AuroraGlow variant="violet" />
        <div className="absolute inset-x-0 top-0 z-[1] h-[200px] bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-[1] h-[200px] bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center pt-40 text-center">
          <Reveal>
            <h2 className="font-heading text-5xl italic leading-[0.9] tracking-tight md:text-6xl lg:text-7xl">
              Your next website starts here.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 max-w-md text-sm font-light text-white/60 md:text-base">
              Book a free strategy call. See what AI-powered design can do.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#"
                className="liquid-glass-strong flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform hover:scale-105"
              >
                Book a Call
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-105"
              >
                View Pricing
              </a>
            </div>
          </Reveal>

          <footer className="mt-32 w-full border-t border-white/10 pb-8 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <span className="text-xs font-light text-white/40">© 2026 Studio</span>
              <div className="flex gap-6 text-xs font-light text-white/40">
                <a href="#" className="transition-colors hover:text-white">Privacy</a>
                <a href="#" className="transition-colors hover:text-white">Terms</a>
                <a href="#" className="transition-colors hover:text-white">Contact</a>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
