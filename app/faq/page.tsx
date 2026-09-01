import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import { getServerTranslations } from "@/lib/i18n/server";

const FAQ_COUNT = 10;

export default function FaqPage() {
  const { t } = getServerTranslations();

  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`faq.q${i + 1}`),
    a: t(`faq.a${i + 1}`),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow={t("faq.eyebrow")}
          title={
            <>
              {t("faq.titleA")} <span className="text-primary">{t("faq.titleB")}</span>
            </>
          }
          subtitle={t("faq.subtitle")}
        />

        <section className="px-5 pb-28 md:pb-36">
          <div className="mx-auto max-w-2xl space-y-4">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 40}>
                <details className="group rounded-2xl border border-border bg-card transition-colors open:border-primary/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[16px] font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="text-xl leading-none text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-6 text-[15px] leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
