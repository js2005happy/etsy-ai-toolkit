import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import { getServerTranslations } from "@/lib/i18n/server";

type Section = {
  n: string;
  title: string;
  content: React.ReactNode;
};

export default function TermsPage() {
  const { t } = getServerTranslations();

  const sections: Section[] = [
    {
      n: "01",
      title: t("marketing.terms.s1t"),
      content: <p>{t("marketing.terms.s1")}</p>,
    },
    {
      n: "02",
      title: t("marketing.terms.s2t"),
      content: (
        <>
          <p>{t("marketing.terms.s2a")}</p>
          <p>{t("marketing.terms.s2b")}</p>
        </>
      ),
    },
    {
      n: "03",
      title: t("marketing.terms.s3t"),
      content: <p>{t("marketing.terms.s3")}</p>,
    },
    {
      n: "04",
      title: t("marketing.terms.s4t"),
      content: (
        <>
          <p>{t("marketing.terms.s4a")}</p>
          <p>{t("marketing.terms.s4b")}</p>
        </>
      ),
    },
    {
      n: "05",
      title: t("marketing.terms.s5t"),
      content: <p>{t("marketing.terms.s5")}</p>,
    },
    {
      n: "06",
      title: t("marketing.terms.s6t"),
      content: <p>{t("marketing.terms.s6")}</p>,
    },
    {
      n: "07",
      title: t("marketing.terms.s7t"),
      content: <p>{t("marketing.terms.s7")}</p>,
    },
    {
      n: "08",
      title: t("marketing.terms.s8t"),
      content: <p>{t("marketing.terms.s8")}</p>,
    },
    {
      n: "09",
      title: t("marketing.terms.s9t"),
      content: <p>{t("marketing.terms.s9")}</p>,
    },
    {
      n: "10",
      title: t("marketing.terms.s10t"),
      content: <p>{t("marketing.terms.s10")}</p>,
    },
    {
      n: "11",
      title: t("marketing.terms.s11t"),
      content: (
        <p>
          {t("marketing.terms.s11")}{" "}
          <a href="mailto:js2005happy@gmail.com" className="text-primary hover:underline">
            js2005happy@gmail.com
          </a>
          .
        </p>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow={t("marketing.terms.eyebrow")}
          title={
            <>
              {t("marketing.terms.title1")} <span className="text-primary">{t("marketing.terms.title2")}</span>
            </>
          }
          subtitle={t("marketing.terms.subtitle")}
        />

        <section className="px-5 pb-28 md:pb-36">
          <div className="mx-auto max-w-3xl">
            <p className="mb-20 text-sm text-muted-foreground">{t("marketing.terms.updated")}</p>

            <div className="space-y-16">
              {sections.map((s) => (
                <Reveal key={s.n}>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-[28px]">
                      <span className="mr-3 text-primary">{s.n}</span>
                      {s.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-muted-foreground">
                      {s.content}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
