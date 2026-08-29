import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import { getServerTranslations } from "@/lib/i18n/server";
import Spotlight from "@/components/aceternity/spotlight";
import MagneticButton from "@/components/aceternity/magnetic-button";

const TOOLS = [
  "Listing Generator",
  "Message Assistant",
  "Keyword Research",
  "Pricing Advisor",
  "Social Media Posts",
  "Listing Translator",
  "Listing Optimizer",
  "Review Replies",
  "Image Generator",
];

export default function Home() {
  const { t } = getServerTranslations();

  const steps = [
    { n: "01", title: t("home.step1Title"), desc: t("home.step1Desc") },
    { n: "02", title: t("home.step2Title"), desc: t("home.step2Desc") },
    { n: "03", title: t("home.step3Title"), desc: t("home.step3Desc") },
  ];

  const features = [
    { stat: "9", title: t("home.feature1Title"), desc: t("home.feature1Desc") },
    { stat: "2×", title: t("home.feature2Title"), desc: t("home.feature2Desc") },
    { title: t("home.feature3Title"), desc: t("home.feature3Desc") },
    { title: t("home.feature4Title"), desc: t("home.feature4Desc") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pb-20 pt-28 text-center md:pb-28 md:pt-40">
          {/* 电影质感背景：暖金主光 + 青紫轮廓光（产品摄影双色布光） */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* gpt 生成的电影质感背景图 */}
            <img
              src="/hero-bg.webp"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* 底部过渡到背景色（顶部保持图片亮度） */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-transparent to-background" />
            {/* 中央文字区柔和暗化，保证白色大字可读，四周保持图片亮度 */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,28,0.32),transparent_65%)]" />
            {/* 双色轮廓光：左青 + 右品红（增强电影感） */}
            <div className="absolute -top-24 left-[8%] h-[30rem] w-[30rem] rounded-full bg-cyan-400/28 blur-3xl" />
            <div className="absolute -top-16 right-[10%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/28 blur-3xl" />
            {/* 镜头光晕 flare */}
            <div className="absolute top-24 left-1/2 h-40 w-[36rem] -translate-x-1/2 rounded-full bg-white/14 blur-2xl" />
          </div>
          <Spotlight active className="mx-auto max-w-4xl rounded-3xl px-4 py-6" radius={600}>
            <Reveal>
              <div className="liquid-glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                  {t("home.nineTools")}
                </span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mx-auto mt-6 max-w-5xl font-display text-6xl font-semibold leading-[1.02] tracking-[-0.02em] text-foreground md:text-8xl lg:text-9xl">
                {t("home.heroTitleA")}{" "}
                <em className="font-hand text-gradient-gold">{t("home.heroTitleB")}</em>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                {t("home.heroSub")}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <MagneticButton
                  href="/signup"
                  className="rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t("home.startFree")}
                </MagneticButton>
                <a
                  href="#tools"
                  className="text-base text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("home.learnMore")}
                </a>
              </div>
            </Reveal>
          </Spotlight>
        </section>

        {/* Tool marquee */}
        <section className="relative overflow-hidden border-y border-border/50 py-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
          <div className="flex w-max animate-marquee items-center gap-12">
            {[...TOOLS, ...TOOLS].map((tool, i) => (
              <span key={i} className="flex items-center gap-12 whitespace-nowrap">
                <span className="font-display text-lg text-foreground/70">{tool}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
              </span>
            ))}
          </div>
        </section>

        {/* Listing generator showcase */}
        <section id="tools" className="px-5 py-24 md:py-32">
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <p className="text-center text-sm font-medium uppercase tracking-[0.18em] text-primary">
                {t("home.listingGenerator")}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mx-auto mt-4 max-w-3xl text-center font-display text-4xl font-normal leading-[1.06] tracking-[-0.02em] text-foreground md:text-5xl">
                {t("home.writeListingTitle")}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("home.writeListingSub")}
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-14">
              <div className="liquid-glass mx-auto max-w-[820px] overflow-hidden rounded-2xl">
                <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
                  <span className="h-3 w-3 rounded-full bg-border" />
                  <span className="h-3 w-3 rounded-full bg-border" />
                  <span className="h-3 w-3 rounded-full bg-border" />
                  <span className="ml-3 text-xs text-muted-foreground">Listing Generator</span>
                </div>
                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
                  <div className="space-y-3">
                    <div className="h-10 rounded-lg bg-secondary" />
                    <div className="h-24 rounded-lg bg-secondary" />
                    <div className="h-10 rounded-full bg-primary/20" />
                  </div>
                  <div className="space-y-4 rounded-lg bg-secondary/60 p-5">
                    <h3 className="font-display text-lg text-foreground">
                      Handmade Ceramic Mug — Speckled Stoneware
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Wheel-thrown from speckled stoneware, each mug is glazed by hand
                      and fired in small batches. Dishwasher safe, holds 12 oz.
                    </p>
                    <p className="text-xs text-primary">★ 5.0 · Ships in 1–2 days</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Feature grid */}
        <section className="px-5 py-24 md:py-32">
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <h2 className="mx-auto max-w-3xl text-center font-display text-4xl font-normal leading-[1.06] tracking-[-0.02em] text-foreground md:text-5xl">
                {t("home.everythingTitle")}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("home.everythingSub")}
              </p>
            </Reveal>

            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 80} className="h-full">
                  <div className="liquid-glass flex h-full flex-col rounded-2xl p-8 md:p-10">
                    {f.stat && (
                      <span className="font-display text-6xl font-normal leading-none text-primary">
                        {f.stat}
                      </span>
                    )}
                    <h3 className={`${f.stat ? "mt-6" : ""} text-2xl font-semibold tracking-tight text-foreground`}>
                      {f.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Value prop */}
        <section className="px-5 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h2 className="font-display text-4xl font-normal leading-[1.06] tracking-[-0.02em] text-foreground md:text-5xl">
                {t("home.getBackTitle")}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("home.getBackSub")}
              </p>
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="px-5 py-24 md:py-32">
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <p className="text-center text-sm font-medium uppercase tracking-[0.18em] text-primary">
                {t("home.howItWorks")}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mx-auto mt-4 max-w-3xl text-center font-display text-4xl font-normal leading-[1.06] tracking-[-0.02em] text-foreground md:text-5xl">
                {t("home.threeStepsTitle")}
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 80} className="h-full">
                  <div className="liquid-glass flex h-full flex-col rounded-2xl p-8">
                    <span className="font-display text-lg text-primary">{s.n}</span>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 py-28 text-center md:py-36">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-4xl font-normal leading-[1.06] tracking-[-0.02em] text-foreground md:text-5xl">
                {t("home.finalTitle")}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                {t("home.finalSub")}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Link
                href="/signup"
                className="mt-8 inline-block rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("home.startFree")}
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
