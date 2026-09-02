import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import ContactForm from "@/components/contact/contact-form";
import { Mail } from "lucide-react";
import { getServerTranslations } from "@/lib/i18n/server";

export default function ContactPage() {
  const { t } = getServerTranslations();
  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow={t("marketing.contact.eyebrow")}
          title={
            <>
              {t("marketing.contact.title1")} <span className="serif-accent grad">{t("marketing.contact.title2")}</span>
            </>
          }
          subtitle={t("marketing.contact.subtitle")}
        />

        <section className="px-5 pb-28 md:pb-36">
          <div className="mx-auto max-w-xl">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8">
              <ContactForm />
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:js2005happy@gmail.com" className="hover:text-foreground hover:underline">
                js2005happy@gmail.com
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
