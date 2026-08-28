import Link from "next/link";
import { headers } from "next/headers";
import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import PricingClient from "@/components/pricing/pricing-client";
import { createClient } from "@/lib/supabase/server";

// Sentinel values some proxies emit for "no country"; never pass these to Paddle.
const INVALID_COUNTRIES = new Set(["XX", "ZZ"]);

export default async function PricingPage() {
  const rawCountry = headers().get("x-vercel-ip-country");

  let countryCode: string | null = null;
  if (rawCountry) {
    const normalized = rawCountry.trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(normalized) && !INVALID_COUNTRIES.has(normalized)) {
      countryCode = normalized;
    }
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Pricing"
          title={
            <>
              Simple pricing.{" "}
              <span className="text-[#ff8a52]">Powerful AI.</span>
            </>
          }
          subtitle="Choose the plan that fits your shop. Upgrade, downgrade, or cancel anytime."
        />

        <PricingClient
          countryCode={countryCode}
          userEmail={user?.email ?? null}
          userId={user?.id ?? null}
        />

        <section className="px-5 pb-24 md:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm text-white/60">
              Questions about billing?{" "}
              <a
                href="mailto:js2005happy@gmail.com"
                className="text-[#ff8a52] hover:underline"
              >
                Contact us
              </a>
              . See our{" "}
              <Link href="/refund" className="text-[#ff8a52] hover:underline">
                refund policy
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
