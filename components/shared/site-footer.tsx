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
      </div>
    </footer>
  );
}
