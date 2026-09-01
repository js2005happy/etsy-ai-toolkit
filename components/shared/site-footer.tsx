import Link from "next/link";
import Logo from "@/components/shared/logo";

export default function SiteFooter() {
  return (
    <footer className="k-footer">
      <div className="k-wrap">
        <div className="k-foot-grid">
          <div>
            <Logo />
            <p className="k-foot-brand">Words for people who make things by hand.</p>
          </div>
          <div>
            <h5>Product</h5>
            <Link href="/tools">Tools</Link>
            <Link href="/dashboard">Workspace</Link>
            <Link href="/examples">Examples</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div>
            <h5>Learn</h5>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/examples">Templates</Link>
            <Link href="/how-it-works">Seller guide</Link>
          </div>
          <div>
            <h5>Company</h5>
            <Link href="/contact">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
        <div className="k-foot-bottom">
          <div>2026 Craftly. Made for makers.</div>
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
            aria-label="Etsy AI Toolkit on Product Hunt"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1236192&theme=dark"
              alt="Etsy AI Toolkit - Made by you. Written by AI. | Product Hunt"
              width={250}
              height={54}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
