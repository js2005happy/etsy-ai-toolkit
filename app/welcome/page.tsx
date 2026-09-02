import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import SiteFooter from "@/components/shared/site-footer";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import Reveal from "@/components/shared/reveal";
import { getServerTranslations } from "@/lib/i18n/server";

export default function WelcomePage() {
  const { t } = getServerTranslations();
  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-5 py-24">
        <Reveal>
          <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-10 text-center md:p-12">
            <h1 className="font-sans text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              {t("marketing.welcome.title")}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {t("marketing.welcome.body")}
            </p>
            <Link href="/dashboard" className="mt-8 inline-block">
              <span className="rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-opacity hover:opacity-90">
                {t("marketing.welcome.cta")}
              </span>
            </Link>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
