import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import Reveal from "@/components/shared/reveal";
import Parallax from "@/components/shared/parallax";
import { WavePerson, PenPerson, LovePerson } from "@/components/shared/doodle-people";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageCircle,
  Share2,
  Star,
  Megaphone,
  Search,
  Languages,
  Wand2,
  DollarSign,
  ArrowRight,
} from "lucide-react";

const tools = [
  {
    icon: FileText,
    name: "Listing Generator",
    desc: "Turn product notes into SEO titles and descriptions that rank.",
    href: "/dashboard/listing",
  },
  {
    icon: MessageCircle,
    name: "Message Assistant",
    desc: "Reply to customers with friendly, on-brand answers in seconds.",
    href: "/dashboard/messages",
  },
  {
    icon: Share2,
    name: "Social Media Posts",
    desc: "Captions and hashtags for Instagram, Pinterest, and TikTok.",
    href: "/dashboard/social",
  },
  {
    icon: Star,
    name: "Review Reply Assistant",
    desc: "Respond to reviews professionally and keep your rating high.",
    href: "/dashboard/reviews",
  },
  {
    icon: Megaphone,
    name: "Announcement Generator",
    desc: "Welcome, promo, and about-us copy written for you.",
    href: "/dashboard/announcement",
  },
  {
    icon: Search,
    name: "Keyword Research",
    desc: "Find high-volume keywords buyers actually search for.",
    href: "/dashboard/keywords",
  },
  {
    icon: Languages,
    name: "Listing Translator",
    desc: "Localize your listings into multiple languages in one click.",
    href: "/dashboard/translate",
  },
  {
    icon: Wand2,
    name: "Listing Optimizer",
    desc: "Improve an existing listing for better SEO and conversions.",
    href: "/dashboard/optimizer",
  },
  {
    icon: DollarSign,
    name: "Pricing Advisor",
    desc: "Get a suggested price and profit breakdown for any product.",
    href: "/dashboard/pricing",
  },
];

const steps = [
  { n: "01", title: "Describe", desc: "Tell the AI what you're selling in plain words." },
  { n: "02", title: "Generate", desc: "Get listing copy, replies, or posts in seconds." },
  { n: "03", title: "Publish", desc: "Copy, paste, and get back to making." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pb-24 pt-32 md:pb-32 md:pt-44">
          {/* 远景：背景图（视差最慢，最远） */}
          <div className="absolute inset-0 z-0">
            <Parallax speed={0.12} className="h-full w-full">
              <div
                className="absolute inset-[-12%] bg-cover bg-center"
                style={{ backgroundImage: "url(/hero-cinema.webp)" }}
              />
            </Parallax>
          </div>

          {/* 遮罩渐变 */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />

          {/* 中景：流动光斑（视差） */}
          <div className="pointer-events-none absolute inset-0 z-20">
            <Parallax speed={0.3} className="h-full w-full">
              <div className="absolute left-[8%] top-[16%] h-72 w-72 rounded-full bg-amber-400/25 blur-3xl animate-aurora-1" />
              <div className="absolute right-[8%] top-[34%] h-80 w-80 rounded-full bg-orange-500/20 blur-3xl animate-aurora-2" />
              <div className="absolute bottom-[10%] left-[30%] h-64 w-64 rounded-full bg-sky-400/20 blur-3xl animate-aurora-3" />
            </Parallax>
          </div>

          {/* 噪点 */}
          <div className="pointer-events-none absolute inset-0 z-30 opacity-[0.07] mix-blend-overlay">
            <div className="h-full w-full animate-film-grain bg-[radial-gradient(circle_at_50%_50%,#fff_0%,transparent_55%)]" />
          </div>

          {/* 前景内容 */}
          <div className="relative z-40 mx-auto max-w-4xl text-center">
            <h1 className="animate-fade-up font-display text-5xl font-semibold leading-[1.1] text-white md:text-7xl">
              Turn ideas into{" "}
              <span className="font-accent font-normal text-amber-300">listings</span> in seconds
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-white/80 [animation-delay:120ms] md:text-xl">
              AI-powered tools that write your listings, answer customers, and grow your shop —
              so you can get back to making.
            </p>
            <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 [animation-delay:240ms] sm:flex-row">
              <Link href="/signup">
                <Button className="h-12 px-8 text-base font-medium">Get started free</Button>
              </Link>
              <Link href="#tools">
                <Button variant="link" className="h-12 px-4 text-base font-medium text-white hover:text-white/80">
                  See the tools <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="animate-fade-up mt-6 text-sm text-white/60 [animation-delay:360ms]">No credit card required · 10 free credits</p>
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="relative bg-[#f5f5f7] px-5 py-20 md:py-28">
          {/* 装饰手绘人物（视差 + 浮动） */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <Parallax speed={0.25} className="h-full w-full">
              <div className="absolute left-[3%] top-[10%] hidden opacity-70 animate-float-slow md:block">
                <WavePerson className="h-28 w-28" />
              </div>
              <div className="absolute bottom-[8%] right-[4%] hidden opacity-60 animate-float md:block">
                <PenPerson className="h-24 w-24" />
              </div>
            </Parallax>
          </div>

          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <h2 className="font-display text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Nine tools. <span className="font-accent font-normal text-primary">Zero busywork.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Everything you need to run your shop, powered by the latest AI models.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool, i) => (
                <Reveal key={tool.name} delay={i * 60} className="h-full">
                  <Link href={tool.href} className="group flex h-full">
                    <div className="flex h-full w-full flex-col rounded-2xl border border-[#d2d2d7] bg-white p-8 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
                      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5f5f7] text-foreground transition-colors duration-300 group-hover:bg-[#0071e3]/10">
                        <tool.icon className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:text-[#0071e3]" />
                      </div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{tool.name}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{tool.desc}</p>
                      <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Open tool <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="relative px-5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <h2 className="font-display text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Three steps to <span className="font-accent font-normal text-primary">done</span>
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 80}>
                  <div className="group rounded-2xl bg-white p-8 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
                    <span className="inline-block font-display text-5xl font-semibold text-primary transition-transform duration-300 group-hover:scale-110">{s.n}</span>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{s.title}</h3>
                    <p className="mt-2 text-muted-foreground">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="relative bg-[#f5f5f7] px-5 py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0 z-0">
            <Parallax speed={0.2} className="h-full w-full">
              <div className="absolute right-[6%] top-[14%] hidden opacity-60 animate-float-slow md:block">
                <LovePerson className="h-24 w-24" />
              </div>
            </Parallax>
          </div>

          <div className="relative z-10 mx-auto max-w-4xl">
            <div className="mb-14 text-center">
              <h2 className="font-display text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Simple, <span className="font-accent font-normal text-primary">honest</span> pricing
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
                Start free and upgrade when your shop takes off.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-[#d2d2d7] bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">Free</h3>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
                  $0<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li>10 credits per month</li>
                  <li>Access to all nine tools</li>
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="mt-8 w-full py-3 font-medium">
                    Start free
                  </Button>
                </Link>
              </div>

              <div className="rounded-2xl border border-[#d2d2d7] bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">Pro</h3>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                    Popular
                  </span>
                </div>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
                  $19<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li>Unlimited credits</li>
                  <li>Priority AI processing</li>
                  <li>Advanced SEO templates</li>
                </ul>
                <Link href="/signup">
                  <Button className="mt-8 w-full py-3 font-medium">Upgrade to Pro</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative px-5 py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Ready to <span className="font-accent font-normal text-primary">sell more?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
              Join today and get 10 free credits. No credit card required.
            </p>
            <Link href="/signup">
              <Button className="mt-8 px-10 py-3 text-base font-medium">Get started free</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d2d2d7] bg-[#f5f5f7] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-[#6e6e73] md:flex-row">
          <span className="font-display text-lg font-semibold text-[#1d1d1f]">Etsy AI Toolkit</span>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/pricing" className="hover:text-[#1d1d1f]">Pricing</Link>
            <Link href="/terms" className="hover:text-[#1d1d1f]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#1d1d1f]">Privacy</Link>
            <Link href="/refund" className="hover:text-[#1d1d1f]">Refunds</Link>
            <a href="mailto:js2005happy@gmail.com" className="hover:text-[#1d1d1f]">Contact</a>
          </nav>
          <p>© 2026 Etsy Seller AI Toolkit. Not affiliated with Etsy, Inc.</p>
        </div>
      </footer>
    </div>
  );
}
