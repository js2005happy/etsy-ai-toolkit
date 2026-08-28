import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 px-5 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f] md:text-5xl">
              Simple, honest pricing
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-[#6e6e73]">
              Start free and upgrade when your shop takes off.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-[#d2d2d7] bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">Free</h3>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-[#1d1d1f]">
                $0<span className="text-base font-normal text-[#6e6e73]">/mo</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-[#6e6e73]">
                <li>10 credits per month</li>
                <li>Access to all nine tools</li>
                <li>Listing, messaging, SEO, and translation</li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="mt-8 w-full rounded-full py-3 font-medium">
                  Start free
                </Button>
              </Link>
            </div>

            <div className="rounded-3xl border border-[#d2d2d7] bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">Pro</h3>
                <span className="rounded-full bg-[#0071e3] px-3 py-1 text-xs font-medium text-white">
                  Popular
                </span>
              </div>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-[#1d1d1f]">
                $19<span className="text-base font-normal text-[#6e6e73]">/mo</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-[#6e6e73]">
                <li>Unlimited credits</li>
                <li>Priority AI processing</li>
                <li>Advanced SEO templates</li>
                <li>Cancel anytime</li>
              </ul>
              <Link href="/signup">
                <Button className="mt-8 w-full rounded-full bg-[#0071e3] py-3 font-medium text-white hover:bg-[#0077ed]">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-[#d2d2d7] bg-[#f5f5f7] py-10">
        <div className="mx-auto max-w-6xl px-5 text-center text-sm text-[#6e6e73]">
          <p>© 2026 Etsy Seller AI Toolkit. Not affiliated with Etsy, Inc.</p>
        </div>
      </footer>
    </div>
  );
}
