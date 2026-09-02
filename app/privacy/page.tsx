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

export default function PrivacyPage() {
  const { t } = getServerTranslations();

  const sections: Section[] = [
    {
      n: "01",
      title: t("marketing.privacy.s1t"),
      content: (
        <>
          <p>{t("marketing.privacy.s1")}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t("marketing.privacy.s1a")}</li>
            <li>{t("marketing.privacy.s1b")}</li>
            <li>{t("marketing.privacy.s1c")}</li>
          </ul>
        </>
      ),
    },
    {
      n: "02",
      title: t("marketing.privacy.s2t"),
      content: (
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("marketing.privacy.s2a")}</li>
          <li>{t("marketing.privacy.s2b")}</li>
          <li>{t("marketing.privacy.s2c")}</li>
          <li>{t("marketing.privacy.s2d")}</li>
        </ul>
      ),
    },
    {
      n: "03",
      title: t("marketing.privacy.s3t"),
      content: <p>{t("marketing.privacy.s3")}</p>,
    },
    {
      n: "04",
      title: t("marketing.privacy.s4t"),
      content: <p>{t("marketing.privacy.s4")}</p>,
    },
    {
      n: "05",
      title: t("marketing.privacy.s5t"),
      content: <p>{t("marketing.privacy.s5")}</p>,
    },
    {
      n: "06",
      title: t("marketing.privacy.s6t"),
      content: <p>{t("marketing.privacy.s6")}</p>,
    },
    {
      n: "07",
      title: t("marketing.privacy.s7t"),
      content: <p>{t("marketing.privacy.s7")}</p>,
    },
    {
      n: "08",
      title: t("marketing.privacy.s8t"),
      content: <p>{t("marketing.privacy.s8")}</p>,
    },
    {
      n: "09",
      title: t("marketing.privacy.s9t"),
      content: (
        <p>
          {t("marketing.privacy.s9")}{" "}
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
          eyebrow={t("marketing.privacy.eyebrow")}
          title={
            <>
              {t("marketing.privacy.title1")} <span className="text-primary">{t("marketing.privacy.title2")}</span>
            </>
          }
          subtitle={t("marketing.privacy.subtitle")}
        />

        <section className="px-5 pb-28 md:pb-36">
          <div className="mx-auto max-w-3xl">
            <p className="mb-20 text-sm text-muted-foreground">{t("marketing.privacy.updated")}</p>

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
