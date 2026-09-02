'use client'

import Link from "next/link";
import Logo from "@/components/shared/logo";
import { useI18n } from "@/lib/i18n/client";

export default function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="k-footer">
      <div className="k-wrap">
        <div className="k-foot-grid">
          <div>
            <Logo />
            <p className="k-foot-brand">{t("footer.tagline")}</p>
          </div>
          <div>
            <h5>{t("footer.product")}</h5>
            <Link href="/tools">{t("footer.tools")}</Link>
            <Link href="/dashboard">{t("footer.workspace")}</Link>
            <Link href="/examples">{t("footer.examples")}</Link>
            <Link href="/pricing">{t("footer.pricing")}</Link>
          </div>
          <div>
            <h5>{t("footer.learn")}</h5>
            <Link href="/how-it-works">{t("footer.howItWorks")}</Link>
            <Link href="/faq">{t("footer.faq")}</Link>
            <Link href="/examples">{t("footer.templates")}</Link>
            <Link href="/how-it-works">{t("footer.sellerGuide")}</Link>
          </div>
          <div>
            <h5>{t("footer.company")}</h5>
            <Link href="/contact">{t("footer.about")}</Link>
            <Link href="/contact">{t("footer.contact")}</Link>
            <Link href="/privacy">{t("footer.privacy")}</Link>
            <Link href="/terms">{t("footer.terms")}</Link>
            <Link href="/refund">{t("footer.refunds")}</Link>
          </div>
        </div>
        <div className="k-foot-bottom">
          <div>2026 Craftly. {t("footer.madeFor")}</div>
          <div>Etsy · Shopify · Amazon · Instagram · Pinterest · TikTok · eBay</div>
        </div>
        <div className="k-badges">
          <a
            href="https://dang.ai"
            target="_blank"
            rel="dofollow noopener"
            aria-label="Verified on DANG!"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://assets.dang.ai/badges/dang-verified-dark.png"
              alt="Verified on DANG!"
              width={180}
              height={65}
            />
          </a>
          <a
            href="https://www.toolpilot.ai"
            target="_blank"
            rel="dofollow noopener"
            aria-label="ToolPilot AI"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.toolpilot.ai/cdn/shop/files/f-w_690x151_crop_center.png"
              alt="ToolPilot AI"
              width={180}
              height={39}
            />
          </a>
          <a
            href="https://www.producthunt.com/products/etsy-ai-toolkit?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-etsy-ai-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Craftly on Product Hunt"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1236192&theme=dark"
              alt="Craftly - Made by you. Written by AI. | Product Hunt"
              width={250}
              height={54}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
