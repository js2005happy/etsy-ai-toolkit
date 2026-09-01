'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { initializePaddle, CheckoutEventNames } from '@paddle/paddle-js'
import type { Paddle } from '@paddle/paddle-js'
import Reveal from '@/components/shared/reveal'
import Faq from '@/components/shared/faq'
import { TIERS } from '@/lib/pricing'
import type { Tier } from '@/lib/pricing'

type BillingPeriod = 'month' | 'year'

// Static marketing copy that matches the source site. Prices and checkout ids
// come from lib/pricing.ts so the page and billing never drift apart.
const PLAN_COPY: Record<string, { who: string; features: string[] }> = {
  Free: {
    who: 'One shop, getting started.',
    features: [
      '10 generations a month',
      '3 image generations a month',
      'One shop connected',
      'Your voice profile, included',
      'Publish to Etsy and Instagram',
      'Export as CSV or Markdown',
    ],
  },
  Basic: {
    who: 'One maker, steady output.',
    features: [
      '100 generations a month',
      '50 image generations a month',
      'Two shops connected',
      'All seven marketplace channels',
      'Bulk generation from one photo',
      'Email support, 2 days',
    ],
  },
  Pro: {
    who: 'One maker, selling seriously.',
    features: [
      '300 generations a month',
      '120 image generations a month',
      'Five shops, all seven marketplaces',
      'Priority voice tuning',
      'Advanced bulk generation',
      'Buyer reply drafting',
      'Email support, 1 day',
    ],
  },
  Scale: {
    who: 'Two or more people, one brand.',
    features: [
      '1000 generations a month',
      '300 image generations a month',
      'Up to 10 shops',
      'Per-seat voice profiles',
      'Approval flow before publishing',
      'Private API beta access',
      'Priority support, 4 hours',
    ],
  },
}

const COMPARISON: { label: string; cells: { text: string; cls: string }[] }[] = [
  {
    label: 'Generations / month',
    cells: [
      { text: '10', cls: '' },
      { text: '100', cls: '' },
      { text: '300', cls: 'yes hl' },
      { text: '1000', cls: 'yes' },
    ],
  },
  {
    label: 'Image generations / month',
    cells: [
      { text: '3', cls: '' },
      { text: '50', cls: '' },
      { text: '120', cls: 'hl' },
      { text: '300', cls: 'yes' },
    ],
  },
  {
    label: 'Connected shops',
    cells: [
      { text: '1', cls: '' },
      { text: '2', cls: '' },
      { text: '5', cls: 'hl' },
      { text: '10', cls: 'yes' },
    ],
  },
  {
    label: 'Marketplace channels',
    cells: [
      { text: '2', cls: '' },
      { text: 'All 7', cls: 'hl' },
      { text: 'All 7', cls: 'yes' },
      { text: 'All 7', cls: 'yes' },
    ],
  },
  {
    label: 'Voice profiles',
    cells: [
      { text: '1', cls: '' },
      { text: '2', cls: '' },
      { text: '5', cls: 'hl' },
      { text: '10, per seat', cls: 'yes' },
    ],
  },
  {
    label: 'Bulk generation from one photo',
    cells: [
      { text: '—', cls: 'no' },
      { text: '✓', cls: 'yes hl' },
      { text: '✓', cls: 'yes' },
      { text: '✓', cls: 'yes' },
    ],
  },
  {
    label: 'Buyer reply drafting',
    cells: [
      { text: '—', cls: 'no' },
      { text: '—', cls: 'no' },
      { text: '✓', cls: 'yes hl' },
      { text: '✓', cls: 'yes' },
    ],
  },
  {
    label: 'Per-seat voice profiles',
    cells: [
      { text: '—', cls: 'no' },
      { text: '—', cls: 'no' },
      { text: '—', cls: 'no' },
      { text: '✓', cls: 'yes' },
    ],
  },
  {
    label: 'Approval flow',
    cells: [
      { text: '—', cls: 'no' },
      { text: '—', cls: 'no' },
      { text: '—', cls: 'no' },
      { text: '✓', cls: 'yes' },
    ],
  },
  {
    label: 'Private API beta',
    cells: [
      { text: '—', cls: 'no' },
      { text: '—', cls: 'no' },
      { text: '—', cls: 'no' },
      { text: '✓', cls: 'yes' },
    ],
  },
  {
    label: 'Support',
    cells: [
      { text: 'Community', cls: '' },
      { text: 'Email, 2 days', cls: 'hl' },
      { text: 'Email, 1 day', cls: 'yes' },
      { text: 'Priority, 4 hours', cls: 'yes' },
    ],
  },
]

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
  const [period, setPeriod] = useState<BillingPeriod>('month')
  const [paddle, setPaddle] = useState<Paddle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const redirectedRef = useRef(false)

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    const env = process.env.NEXT_PUBLIC_PADDLE_ENV

    if (!token) {
      setError('Paddle client token is not configured.')
      return
    }
    if (env !== 'production' && env !== 'sandbox') {
      setError('Paddle environment is not configured.')
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

  const ctaLabel = (tier: Tier) => {
    if (tier.name === 'Free') return 'Start free — no card'
    if (tier.name === 'Pro') return 'Start Pro'
    return `Start ${tier.name}`
  }

  return (
    <>
      <section className="k-wrap k-page-head">
        <div className="k-breadcrumb">
          <Link href="/">Home</Link> / Pricing
        </div>
        <div className="eyebrow">Pricing</div>
        <h1 className="k-h1" style={{ marginTop: 16 }}>
          Free until it
          <br />
          <span className="grad">pays for</span>{' '}
          <em className="serif-accent">itself.</em>
        </h1>
        <p className="k-lead">
          Ten generations a month, forever, on us. When you outgrow that, paid
          plans start at $9.
        </p>

        <div className="k-toggle">
          <div className="k-chips">
            <button
              type="button"
              className={`k-chip${period === 'month' ? ' on' : ''}`}
              onClick={() => setPeriod('month')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`k-chip${period === 'year' ? ' on' : ''}`}
              onClick={() => setPeriod('year')}
            >
              Yearly
            </button>
          </div>
          <span className="k-save">Yearly saves two months</span>
        </div>
      </section>

      <section className="k-wrap" id="plans" style={{ paddingTop: 0 }}>
        {error && <p className="k-muted">{error}</p>}
        <div className="k-plans-4">
          {TIERS.map((tier, i) => {
            const copy = PLAN_COPY[tier.name]
            const price = tier.priceUsd
              ? period === 'month'
                ? `$${tier.priceUsd.month}`
                : `$${tier.priceUsd.year}`
              : '$0'
            const unit = !tier.priceUsd
              ? 'forever'
              : period === 'month'
                ? '/ month'
                : '/ year'
            const billed = !tier.priceUsd
              ? ' '
              : period === 'month'
                ? 'Billed monthly'
                : 'Billed yearly'
            const hot = tier.name === 'Pro'

            return (
              <Reveal
                key={tier.name}
                className={`k-plan${hot ? ' hot' : ''}`}
                delay={i * 100}
              >
                {hot && <div className="k-badge">MOST POPULAR</div>}
                <h3>{tier.name}</h3>
                <p className="k-who">{copy.who}</p>
                <div className="k-price">
                  <b>{price}</b>
                  <span>{unit}</span>
                </div>
                <p className="k-billed">{billed}</p>
                <ul>
                  {copy.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {tier.name === 'Free' ? (
                  <Link href="/signup" className="k-btn k-btn-block">
                    Start free — no card
                  </Link>
                ) : hot ? (
                  <button
                    type="button"
                    className="k-btn k-btn-primary k-btn-block"
                    onClick={() => handleSubscribe(tier)}
                    disabled={!paddle}
                  >
                    <span>Start Pro</span>
                    <i className="k-shine" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="k-btn k-btn-block"
                    onClick={() => handleSubscribe(tier)}
                    disabled={!paddle}
                  >
                    {ctaLabel(tier)}
                  </button>
                )}
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="k-wrap" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="eyebrow">Side by side</div>
          <h2 className="k-h2">Everything that&apos;s included.</h2>
        </Reveal>
        <div className="k-table-wrap">
          <table className="k-table">
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Free</th>
                <th>Basic</th>
                <th>Pro</th>
                <th>Scale</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  {row.cells.map((c, j) => (
                    <td key={j} className={c.cls}>
                      {c.text}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="k-wrap" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="eyebrow">FAQ</div>
          <h2 className="k-h2">Before you pay us anything.</h2>
        </Reveal>
        <Faq
          items={[
            {
              q: 'What counts as one generation?',
              a: "One run of one tool, including all three variants it returns. Regenerating the same input doesn't cost extra for the first three tries.",
            },
            {
              q: 'Do I need a credit card to start?',
              a: 'No. The free plan needs an email and nothing else. We ask for a card only when you choose to upgrade to Basic or above.',
            },
            {
              q: 'What happens when I hit the free limit?',
              a: "Nothing breaks. Generation pauses until the month rolls over, and everything you've already published stays live. We'll email you once, not five times.",
            },
            {
              q: 'Can I change plans later?',
              a: 'Any time. Upgrades take effect immediately; downgrades apply at the start of your next billing period. Your published work is unaffected either way.',
            },
            {
              q: 'Can I cancel mid-month?',
              a: "Any time, from the dashboard, in two clicks. We don't prorate — you keep access until the end of the period you paid for.",
            },
            {
              q: 'Do you offer refunds?',
              a: "Within 30 days of your first payment, yes — email us and we'll refund it without asking why.",
            },
            {
              q: 'Is there a discount for teams or schools?',
              a: 'Registered nonprofits and teaching studios get 50% off Scale. Write to us with proof of status.',
            },
          ]}
        />

        <Reveal className="k-cta-band" style={{ marginTop: 80 }}>
          <h2 className="k-h2">Start on the free plan. Upgrade when it&apos;s obvious.</h2>
          <p className="k-lead">
            Ten generations a month, no card, no call. Paid plans start at $9
            (Basic).
          </p>
          <div className="k-cta-row">
            <Link href="/dashboard" className="k-btn k-btn-primary">
              <span>Open the workspace</span>
              <i className="k-shine" />
            </Link>
            <Link href="/how-it-works" className="k-btn">
              See how it works
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
