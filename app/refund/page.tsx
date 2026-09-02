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

export default function RefundPage() {
  const { t } = getServerTranslations();

  const sections: Section[] = [
    {
      n: "01",
      title: t("marketing.refund.s1t"),
      content: <p>{t("marketing.refund.s1")}</p>,
    },
    {
      n: "02",
      title: t("marketing.refund.s2t"),
      content: <p>{t("marketing.refund.s2")}</p>,
    },
    {
      n: "03",
      title: t("marketing.refund.s3t"),
      content: (
        <>
          <p>{t("marketing.refund.s3a")}</p>
          <p>{t("marketing.refund.s3b")}</p>
        </>
      ),
    },
    {
      n: "04",
      title: t("marketing.refund.s4t"),
      content: <p>{t("marketing.refund.s4")}</p>,
    },
    {
      n: "05",
      title: t("marketing.refund.s5t"),
      content: (
        <p>
          {t("marketing.refund.s5")}{" "}
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
          eyebrow={t("marketing.refund.eyebrow")}
          title={
            <>
              {t("marketing.refund.title1")} <span className="text-primary">{t("marketing.refund.title2")}</span>
            </>
          }
          subtitle={t("marketing.refund.subtitle")}
        />

        <section className="px-5 pb-28 md:pb-36">
          <div className="mx-auto max-w-3xl">
            <p className="mb-20 text-sm text-muted-foreground">{t("marketing.refund.updated")}</p>

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
