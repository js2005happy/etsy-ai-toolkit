import Link from "next/link";
import { getServerTranslations } from "@/lib/i18n/server";

type Column = {
  title: string;
  links: { label: string; href: string }[];
};

export default function SiteFooter() {
  const { t } = getServerTranslations();

  const columns: Column[] = [
    {
      title: t("footer.product"),
      links: [
        { label: t("footer.listingGenerator"), href: "/dashboard/listing" },
        { label: t("footer.messageAssistant"), href: "/dashboard/messages" },
        { label: t("footer.keywordResearch"), href: "/dashboard/keywords" },
        { label: t("footer.pricingAdvisor"), href: "/dashboard/pricing" },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { label: t("footer.howItWorks"), href: "/#how" },
        { label: t("footer.pricing"), href: "/pricing" },
        { label: t("footer.dashboard"), href: "/dashboard" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("footer.contact"), href: "mailto:js2005happy@gmail.com" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.terms"), href: "/terms" },
        { label: t("footer.privacy"), href: "/privacy" },
        { label: t("footer.refunds"), href: "/refund" },
      ],
    },
    {
      title: t("footer.account"),
      links: [
        { label: t("footer.logIn"), href: "/login" },
        { label: t("footer.signUp"), href: "/signup" },
      ],
    },
  ];

  return (
    <footer className="px-5 pb-10">
      <div className="glass-cinematic mx-auto max-w-[1200px] rounded-3xl px-8 pb-10 pt-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{col.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-white/15 pt-5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
