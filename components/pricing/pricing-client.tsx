'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { initializePaddle, CheckoutEventNames } from '@paddle/paddle-js'
import type { Paddle } from '@paddle/paddle-js'
import { Check, Loader2 } from 'lucide-react'
import Reveal from '@/components/shared/reveal'
import { TIERS } from '@/lib/pricing'
import type { Tier } from '@/lib/pricing'
import { useI18n } from '@/lib/i18n/client'

type BillingPeriod = 'month' | 'year'

interface PricingClientProps {
  countryCode: string | null
  userEmail: string | null
  userId: string | null
}

export default function PricingClient({
  countryCode,
  userEmail,
  userId,
}: PricingClientProps) {
  const { t, ta } = useI18n()
  const [period, setPeriod] = useState<BillingPeriod>('month')
  const [paddle, setPaddle] = useState<Paddle | null>(null)
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const redirectedRef = useRef(false)

  // Initialize Paddle.js once, from env only (never hard-coded).
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    const env = process.env.NEXT_PUBLIC_PADDLE_ENV

    if (!token) {
      setError(
        'Paddle client token is not configured. Set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.'
      )
      setLoading(false)
      return
    }
    if (env !== 'production' && env !== 'sandbox') {
      setError(
        'Paddle environment is not configured. Set NEXT_PUBLIC_PADDLE_ENV to "production" or "sandbox".'
      )
      setLoading(false)
      return
    }

    let cancelled = false
    initializePaddle({
      token,
      environment: env,
      eventCallback: (event) => {
        if (
          event.name === CheckoutEventNames.CHECKOUT_COMPLETED &&
          !redirectedRef.current
        ) {
          redirectedRef.current = true
          window.location.href = '/welcome'
        }
      },
    }).then((instance) => {
      if (cancelled) return
      if (instance) setPaddle(instance)
      else setError('Failed to initialize Paddle.')
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch localized price previews whenever the billing period changes.
  // The Free tier has no priceId — skip it (it renders a static $0).
  useEffect(() => {
    if (!paddle) return
    let cancelled = false
    setLoading(true)
    setError(null)

    const address = countryCode ? { countryCode } : undefined
    const paidTiers = TIERS.filter((tier) => tier.priceId !== null)

    Promise.all(
      paidTiers.map((tier) =>
        paddle
          .PricePreview({
            items: [{ priceId: tier.priceId![period], quantity: 1 }],
            ...(address ? { address } : {}),
          })
          .then((res) => ({
            tier: tier.name,
            total: res.data.details.lineItems[0]?.formattedTotals.total ?? '',
          }))
      )
    )
      .then((results) => {
        if (cancelled) return
        const map: Record<string, string> = {}
        for (const r of results) map[r.tier] = r.total
        setPrices(map)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load prices. Please refresh and try again.')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [paddle, period, countryCode])

  const handleSubscribe = useCallback(
    (tier: Tier) => {
      if (!paddle || !tier.priceId) return
      const priceId = tier.priceId[period]
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        settings: {
          displayMode: 'overlay',
          variant: 'one-page',
          theme: 'dark',
          successUrl: `${window.location.origin}/welcome`,
        },
        ...(userEmail ? { customer: { email: userEmail } } : {}),
        ...(userId ? { customData: { user_id: userId } } : {}),
      })
    },
    [paddle, period, userEmail, userId]
  )

  const isPro = (name: string) => name === 'Pro'
  const isFree = (name: string) => name === 'Free'

  return (
    <section className="px-5 pb-24 md:pb-32">
      <div className="mx-auto max-w-6xl">
        {/* Billing toggle */}
        <div className="mb-12 flex justify-center">
          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] p-1.5 backdrop-blur-xl">
            {(['month', 'year'] as BillingPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {p === 'month' ? t('pricing.monthly') : t('pricing.yearly')}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mb-8 text-center text-sm text-[#ff8a52]">{error}</p>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 100} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-[28px] p-8 md:p-10 ${
                  isPro(tier.name)
                    ? 'border-2 border-[#F1641E] bg-white/[0.04]'
                    : 'border border-white/15 bg-white/[0.04]'
                }`}
              >
                {isPro(tier.name) && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#F1641E] px-3 py-1 text-xs font-semibold text-white">
                    {t('pricing.mostPopular')}
                  </span>
                )}

                <h3 className="text-xl font-semibold tracking-tight text-white">
                  {tier.name}
                </h3>
                <p className="mt-3 text-sm text-white/60">
                  {t(`tiers.${tier.name}.description`)}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  {isFree(tier.name) ? (
                    <span className="text-5xl font-semibold tracking-tight text-white">
                      $0
                    </span>
                  ) : loading ? (
                    <span className="flex items-center gap-2 text-white/50">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </span>
                  ) : (
                    <span className="text-5xl font-semibold tracking-tight text-white">
                      {prices[tier.name] || '—'}
                    </span>
                  )}
                  {!isFree(tier.name) && !loading && prices[tier.name] && (
                    <span className="text-base text-white/60">
                      /{period === 'month' ? t('pricing.mo') : t('pricing.yr')}
                    </span>
                  )}
                </div>
                {period === 'year' && !isFree(tier.name) && (
                  <p className="mt-1 text-xs text-white/40">
                    {t('pricing.billedAnnually')}
                  </p>
                )}

                <ul className="mt-8 flex-1 space-y-3.5 text-[15px] text-white">
                  {ta(`tiers.${tier.name}.features`).map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 h-5 w-5 flex-none text-[#ff8a52]"
                        strokeWidth={2.5}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isFree(tier.name) ? (
                  <Link
                    href="/signup"
                    className="mt-10 block w-full rounded-full border border-white/20 py-3 text-center font-medium text-white hover:bg-white/10"
                  >
                    {t('pricing.startFree')}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSubscribe(tier)}
                    disabled={!paddle || loading}
                    className={`mt-10 block w-full rounded-full py-3 text-center font-medium transition-colors ${
                      isPro(tier.name)
                        ? 'bg-[#F1641E] text-white hover:bg-[#d9560f]'
                        : 'border border-white/20 text-white hover:bg-white/10'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {t('pricing.subscribeTo')} {tier.name}
                  </button>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
