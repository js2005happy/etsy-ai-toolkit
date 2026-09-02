'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { initializePaddle, CheckoutEventNames } from '@paddle/paddle-js'
import type { Paddle } from '@paddle/paddle-js'
import Reveal from '@/components/shared/reveal'
import Faq from '@/components/shared/faq'
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
  const { t } = useI18n()
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
      if (!userId) {
        window.location.href = '/signup'
        return
      }
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
    if (tier.name === 'Free') return t('marketing.pricing.startFree')
    if (tier.name === 'Pro') return t('marketing.pricing.startPro')
    return `${t('marketing.pricing.startPrefix')} ${tier.name}`
  }

  const planCopy: Record<string, { who: string; features: string[] }> = {
    Free: {
      who: t('marketing.pricing.planFreeWho'),
      features: [
        t('marketing.pricing.planFreeF1'),
        t('marketing.pricing.planFreeF2'),
        t('marketing.pricing.planFreeF3'),
        t('marketing.pricing.planFreeF4'),
        t('marketing.pricing.planFreeF5'),
        t('marketing.pricing.planFreeF6'),
      ],
    },
    Basic: {
      who: t('marketing.pricing.planBasicWho'),
      features: [
        t('marketing.pricing.planBasicF1'),
        t('marketing.pricing.planBasicF2'),
        t('marketing.pricing.planBasicF3'),
        t('marketing.pricing.planBasicF4'),
        t('marketing.pricing.planBasicF5'),
        t('marketing.pricing.planBasicF6'),
      ],
    },
    Pro: {
      who: t('marketing.pricing.planProWho'),
      features: [
        t('marketing.pricing.planProF1'),
        t('marketing.pricing.planProF2'),
        t('marketing.pricing.planProF3'),
        t('marketing.pricing.planProF4'),
        t('marketing.pricing.planProF5'),
        t('marketing.pricing.planProF6'),
        t('marketing.pricing.planProF7'),
      ],
    },
    Scale: {
      who: t('marketing.pricing.planScaleWho'),
      features: [
        t('marketing.pricing.planScaleF1'),
        t('marketing.pricing.planScaleF2'),
        t('marketing.pricing.planScaleF3'),
        t('marketing.pricing.planScaleF4'),
        t('marketing.pricing.planScaleF5'),
        t('marketing.pricing.planScaleF6'),
        t('marketing.pricing.planScaleF7'),
      ],
    },
  }

  const comparison: { label: string; cells: { text: string; cls: string }[] }[] = [
    {
      label: t('marketing.pricing.cmp1'),
      cells: [
        { text: '10', cls: '' },
        { text: '100', cls: '' },
        { text: '300', cls: 'yes hl' },
        { text: '1000', cls: 'yes' },
      ],
    },
    {
      label: t('marketing.pricing.cmp2'),
      cells: [
        { text: '3', cls: '' },
        { text: '50', cls: '' },
        { text: '120', cls: 'hl' },
        { text: '300', cls: 'yes' },
      ],
    },
    {
      label: t('marketing.pricing.cmp3'),
      cells: [
        { text: '1', cls: '' },
        { text: '2', cls: '' },
        { text: '5', cls: 'hl' },
        { text: '10', cls: 'yes' },
      ],
    },
    {
      label: t('marketing.pricing.cmp4'),
      cells: [
        { text: '2', cls: '' },
        { text: t('marketing.pricing.cmpAll7'), cls: 'hl' },
        { text: t('marketing.pricing.cmpAll7'), cls: 'yes' },
        { text: t('marketing.pricing.cmpAll7'), cls: 'yes' },
      ],
    },
    {
      label: t('marketing.pricing.cmp5'),
      cells: [
        { text: '1', cls: '' },
        { text: '2', cls: '' },
        { text: '5', cls: 'hl' },
        { text: t('marketing.pricing.cmpPerSeat'), cls: 'yes' },
      ],
    },
    {
      label: t('marketing.pricing.cmp6'),
      cells: [
        { text: '—', cls: 'no' },
        { text: '✓', cls: 'yes hl' },
        { text: '✓', cls: 'yes' },
        { text: '✓', cls: 'yes' },
      ],
    },
    {
      label: t('marketing.pricing.cmp7'),
      cells: [
        { text: '—', cls: 'no' },
        { text: '—', cls: 'no' },
        { text: '✓', cls: 'yes hl' },
        { text: '✓', cls: 'yes' },
      ],
    },
    {
      label: t('marketing.pricing.cmp8'),
      cells: [
        { text: '—', cls: 'no' },
        { text: '—', cls: 'no' },
        { text: '—', cls: 'no' },
        { text: '✓', cls: 'yes' },
      ],
    },
    {
      label: t('marketing.pricing.cmp9'),
      cells: [
        { text: '—', cls: 'no' },
        { text: '—', cls: 'no' },
        { text: '—', cls: 'no' },
        { text: '✓', cls: 'yes' },
      ],
    },
    {
      label: t('marketing.pricing.cmp10'),
      cells: [
        { text: '—', cls: 'no' },
        { text: '—', cls: 'no' },
        { text: '—', cls: 'no' },
        { text: '✓', cls: 'yes' },
      ],
    },
    {
      label: t('marketing.pricing.cmp11'),
      cells: [
        { text: t('marketing.pricing.cmpCommunity'), cls: '' },
        { text: t('marketing.pricing.cmpEmail2'), cls: 'hl' },
        { text: t('marketing.pricing.cmpEmail1'), cls: 'yes' },
        { text: t('marketing.pricing.cmpPriority4'), cls: 'yes' },
      ],
    },
  ]

  return (
    <>
      <section className="k-wrap k-page-head">
        <div className="k-breadcrumb">
          <Link href="/">{t('marketing.pricing.bcHome')}</Link> / {t('marketing.pricing.bcCurrent')}
        </div>
        <div className="eyebrow">{t('marketing.pricing.eyebrow')}</div>
        <h1 className="k-h1" style={{ marginTop: 16 }}>
          {t('marketing.pricing.h1a')}
          <br />
          <span className="grad">{t('marketing.pricing.h1grad')}</span>{' '}
          <em className="serif-accent">{t('marketing.pricing.h1em')}</em>
        </h1>
        <p className="k-lead">{t('marketing.pricing.lead')}</p>

        <div className="k-toggle">
          <div className="k-chips">
            <button
              type="button"
              className={`k-chip${period === 'month' ? ' on' : ''}`}
              onClick={() => setPeriod('month')}
            >
              {t('marketing.pricing.monthly')}
            </button>
            <button
              type="button"
              className={`k-chip${period === 'year' ? ' on' : ''}`}
              onClick={() => setPeriod('year')}
            >
              {t('marketing.pricing.yearly')}
            </button>
          </div>
          <span className="k-save">{t('marketing.pricing.yearlySaves')}</span>
        </div>
      </section>

      <section className="k-wrap" id="plans" style={{ paddingTop: 0 }}>
        {error && <p className="k-muted">{error}</p>}
        <div className="k-plans-4">
          {TIERS.map((tier, i) => {
            const copy = planCopy[tier.name]
            const price = tier.priceUsd
              ? period === 'month'
                ? `$${tier.priceUsd.month}`
                : `$${tier.priceUsd.year}`
              : '$0'
            const unit = !tier.priceUsd
              ? t('marketing.pricing.forever')
              : period === 'month'
                ? t('marketing.pricing.perMonth')
                : t('marketing.pricing.perYear')
            const billed = !tier.priceUsd
              ? ' '
              : period === 'month'
                ? t('marketing.pricing.billedMonthly')
                : t('marketing.pricing.billedYearly')
            const hot = tier.name === 'Pro'

            return (
              <Reveal
                key={tier.name}
                className={`k-plan${hot ? ' hot' : ''}`}
                delay={i * 100}
              >
                {hot && <div className="k-badge">{t('marketing.pricing.mostPopular')}</div>}
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
                    {t('marketing.pricing.startFree')}
                  </Link>
                ) : hot ? (
                  <button
                    type="button"
                    className="k-btn k-btn-primary k-btn-block"
                    onClick={() => handleSubscribe(tier)}
                    disabled={!paddle}
                  >
                    <span>{t('marketing.pricing.startPro')}</span>
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
          <div className="eyebrow">{t('marketing.pricing.sideBySide')}</div>
          <h2 className="k-h2">{t('marketing.pricing.everythingIncluded')}</h2>
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
              {comparison.map((row) => (
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
          <div className="eyebrow">{t('marketing.pricing.faqEyebrow')}</div>
          <h2 className="k-h2">{t('marketing.pricing.faqH')}</h2>
        </Reveal>
        <Faq
          items={[
            { q: t('marketing.pricing.faq1q'), a: t('marketing.pricing.faq1a') },
            { q: t('marketing.pricing.faq2q'), a: t('marketing.pricing.faq2a') },
            { q: t('marketing.pricing.faq3q'), a: t('marketing.pricing.faq3a') },
            { q: t('marketing.pricing.faq4q'), a: t('marketing.pricing.faq4a') },
            { q: t('marketing.pricing.faq5q'), a: t('marketing.pricing.faq5a') },
            { q: t('marketing.pricing.faq6q'), a: t('marketing.pricing.faq6a') },
            { q: t('marketing.pricing.faq7q'), a: t('marketing.pricing.faq7a') },
          ]}
        />

        <Reveal className="k-cta-band" style={{ marginTop: 80 }}>
          <h2 className="k-h2">{t('marketing.pricing.ctaH')}</h2>
          <p className="k-lead">{t('marketing.pricing.ctaLead')}</p>
          <div className="k-cta-row">
            <Link href="/dashboard" className="k-btn k-btn-primary">
              <span>{t('marketing.pricing.ctaBtn1')}</span>
              <i className="k-shine" />
            </Link>
            <Link href="/how-it-works" className="k-btn">
              {t('marketing.pricing.ctaBtn2')}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
