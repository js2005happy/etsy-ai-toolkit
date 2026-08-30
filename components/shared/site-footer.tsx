import Link from "next/link";
import { getServerTranslations } from "@/lib/i18n/server";
import Logo from "@/components/shared/logo";

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
        { label: t("dashboard.toolListingTitle"), href: "/dashboard/listing" },
        { label: t("dashboard.toolMessagesTitle"), href: "/dashboard/messages" },
        { label: t("dashboard.toolSocialTitle"), href: "/dashboard/social" },
        { label: t("dashboard.toolReviewsTitle"), href: "/dashboard/reviews" },
        { label: t("dashboard.toolAnnouncementTitle"), href: "/dashboard/announcement" },
        { label: t("dashboard.toolKeywordsTitle"), href: "/dashboard/keywords" },
        { label: t("dashboard.toolTranslateTitle"), href: "/dashboard/translate" },
        { label: t("dashboard.toolOptimizerTitle"), href: "/dashboard/optimizer" },
        { label: t("dashboard.toolPricingTitle"), href: "/dashboard/pricing" },
        { label: t("dashboard.toolImagesTitle"), href: "/dashboard/images" },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { label: t("footer.howItWorks"), href: "/#how" },
        { label: t("footer.pricing"), href: "/pricing" },
        { label: t("footer.dashboard"), href: "/dashboard" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: "GitHub", href: "https://github.com/js2005happy/etsy-ai-toolkit" },
        { label: t("footer.contact"), href: "/contact" },
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
    <footer className="px-5 pb-12 pt-20">
      <div className="mx-auto max-w-[1200px] border-t border-border pt-12">
        <div className="mb-12 flex items-center gap-2.5">
          <Logo brand={t("nav.brand")} />
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => {
                  const external = link.href.startsWith("http");
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-border pt-6">
          <a
            href="https://dang.ai"
            target="_blank"
            rel="dofollow noopener"
            aria-label="Verified on DANG!"
            className="inline-block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://assets.dang.ai/badges/dang-verified-dark.png"
              alt="Verified on DANG!"
              width={180}
              height={65}
              className="h-auto w-[180px] max-w-full"
            />
          </a>
          <a
            href="https://www.toolpilot.ai"
            target="_blank"
            rel="dofollow noopener"
            aria-label="ToolPilot AI"
            className="inline-block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.toolpilot.ai/cdn/shop/files/f-w_690x151_crop_center.png"
              alt="ToolPilot AI"
              width={180}
              height={39}
              className="h-auto w-[180px] max-w-full"
            />
          </a>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
