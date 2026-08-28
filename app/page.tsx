import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import ProductWindow from "@/components/home/product-window";
import HeroProduct from "@/components/home/hero-product";
import Parallax3D from "@/components/home/parallax-3d";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import { getServerTranslations } from "@/lib/i18n/server";

export default function Home() {
  const { t } = getServerTranslations();

  const steps = [
    { n: "01", title: t("home.step1Title"), desc: t("home.step1Desc") },
    { n: "02", title: t("home.step2Title"), desc: t("home.step2Desc") },
    { n: "03", title: t("home.step3Title"), desc: t("home.step3Desc") },
  ];

  const features = [
    {
      stat: "9",
      title: t("home.feature1Title"),
      desc: t("home.feature1Desc"),
    },
    {
      stat: "2×",
      title: t("home.feature2Title"),
      desc: t("home.feature2Desc"),
    },
    {
      title: t("home.feature3Title"),
      desc: t("home.feature3Desc"),
    },
    {
      title: t("home.feature4Title"),
      desc: t("home.feature4Desc"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative flex min-h-screen flex-col items-center overflow-hidden px-5 pb-24 pt-32 text-center md:pt-40">
          <div className="absolute inset-0" aria-hidden="true">
            <img src="/hero-bg.png" alt="" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/55" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl">
            <Reveal>
              <h1 className="text-[44px] font-bold leading-[1.05] tracking-[-0.02em] text-white md:text-[60px] lg:text-[88px]">
                {t("home.heroTitle")}
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-6 max-w-2xl text-[19px] leading-relaxed text-white/60 md:text-[24px]">
                {t("home.heroSub")}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-6 flex items-center justify-center gap-8">
                <a href="#tools" className="text-[17px] text-[#ff8a52] hover:underline md:text-[21px]">
                  {t("home.learnMore")}
                </a>
                <Link href="/signup" className="text-[17px] text-[#ff8a52] hover:underline md:text-[21px]">
                  {t("home.startFree")}
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={300} className="relative z-10 mt-16 w-full md:mt-20">
            <div className="mx-auto max-w-[920px]">
              <HeroProduct />
            </div>
          </Reveal>
        </section>

        {/* Listing Generator showcase */}
        <section id="tools" className="bg-white/[0.04] px-5 py-24 md:py-32">
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <p className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
                {t("home.listingGenerator")}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mx-auto mt-4 max-w-3xl text-center text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-white md:text-[56px]">
                {t("home.writeListingTitle")}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-5 max-w-2xl text-center text-[17px] leading-relaxed text-white/60 md:text-[21px]">
                {t("home.writeListingSub")}
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-12 md:mt-16">
              <div className="mx-auto max-w-[820px]">
                <Parallax3D>
                  <ProductWindow dark single />
                </Parallax3D>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Feature grid */}
        <section className="px-5 py-24 md:py-32">
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <p className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
                {t("home.nineTools")}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mx-auto mt-4 max-w-3xl text-center text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-white md:text-[56px]">
                {t("home.everythingTitle")}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-5 max-w-2xl text-center text-[17px] leading-relaxed text-white/60 md:text-[21px]">
                {t("home.everythingSub")}
              </p>
            </Reveal>

            <div className="mt-14 grid gap-3 md:grid-cols-2">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 80} className="h-full">
                  <div className="flex h-full flex-col rounded-[18px] border border-white/15 bg-white/[0.04] p-8 md:p-[60px]">
                    {f.stat && (
                      <span className="text-[80px] font-bold leading-none tracking-tight text-white">
                        {f.stat}
                      </span>
                    )}
                    <h3 className={`${f.stat ? "mt-8" : ""} text-[28px] font-semibold tracking-tight text-white md:text-[32px]`}>
                      {f.title}
                    </h3>
                    <p className="mt-2 text-[17px] leading-relaxed text-white/60">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Cinematic dark section */}
        <section className="overflow-hidden bg-black px-5 py-28 md:py-40">
          <div className="mx-auto max-w-[1200px] text-center">
            <Reveal>
              <h2 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#f5f5f7] md:text-[56px]">
                {t("home.getBackTitle")}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-[#a1a1a6] md:text-[21px]">
                {t("home.getBackSub")}
              </p>
            </Reveal>
            <Reveal delay={200} className="mt-14 md:mt-20">
              <div className="animate-kenburns">
                <ProductWindow dark layered />
              </div>
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-white/[0.04] px-5 py-24 md:py-32">
          <div className="mx-auto max-w-[1200px]">
            <Reveal>
              <p className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
                {t("home.howItWorks")}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mx-auto mt-4 max-w-3xl text-center text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-white md:text-[56px]">
                {t("home.threeStepsTitle")}
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-3 md:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 80} className="h-full">
                  <div className="flex h-full flex-col rounded-[18px] border border-white/15 bg-white/[0.04] p-8 md:p-10">
                    <span className="text-sm font-semibold text-white/60">{s.n}</span>
                    <h3 className="mt-4 text-[24px] font-semibold tracking-tight text-white">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[17px] leading-relaxed text-white/60">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 py-28 text-center md:py-40">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-white md:text-[56px]">
                {t("home.finalTitle")}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-white/60 md:text-[19px]">
                {t("home.finalSub")}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Link
                href="/signup"
                className="mt-6 inline-block text-[19px] text-[#ff8a52] hover:underline md:text-[21px]"
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
