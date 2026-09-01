import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Navbar from '@/components/shared/navbar'
import SiteFooter from '@/components/shared/site-footer'
import PricingClient from '@/components/pricing/pricing-client'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Pricing — Craftly',
  description:
    'Free for ten generations a month. Paid plans start at $9 (Basic), $19 (Pro), and $39 (Scale). No card to start.',
}

// Sentinel values some proxies emit for "no country"; never pass these to Paddle.
const INVALID_COUNTRIES = new Set(['XX', 'ZZ'])

export default async function PricingPage() {
  const rawCountry = headers().get('x-vercel-ip-country')

  let countryCode: string | null = null
  if (rawCountry) {
    const normalized = rawCountry.trim().toUpperCase()
    if (/^[A-Z]{2}$/.test(normalized) && !INVALID_COUNTRIES.has(normalized)) {
      countryCode = normalized
    }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <PricingClient
          countryCode={countryCode}
          userEmail={user?.email ?? null}
          userId={user?.id ?? null}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
