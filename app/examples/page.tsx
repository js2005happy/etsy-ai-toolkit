'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar'
import SiteFooter from '@/components/shared/site-footer'
import Reveal from '@/components/shared/reveal'
import CountUp from '@/components/shared/count-up'
import { useI18n } from '@/lib/i18n/client'

type Example = {
  title: string
  cat: 'listings' | 'posts' | 'replies' | 'emails'
  catLabel: string
  beforeLabel: string
  before: string
  after: string
  seconds: number
}

export default function ExamplesPage() {
  const { t } = useI18n()
  const [filter, setFilter] = useState('all')
  const [copied, setCopied] = useState<number | null>(null)

  const EXAMPLES: Example[] = [
    {
      title: t('marketing.examples.ex1title'),
      cat: 'listings',
      catLabel: t('marketing.examples.catListing'),
      beforeLabel: t('marketing.examples.lblMakersNote'),
      before: t('marketing.examples.ex1before'),
      after: t('marketing.examples.ex1after'),
      seconds: 41,
    },
    {
      title: t('marketing.examples.ex2title'),
      cat: 'listings',
      catLabel: t('marketing.examples.catListing'),
      beforeLabel: t('marketing.examples.lblMakersNote'),
      before: t('marketing.examples.ex2before'),
      after: t('marketing.examples.ex2after'),
      seconds: 38,
    },
    {
      title: t('marketing.examples.ex3title'),
      cat: 'listings',
      catLabel: t('marketing.examples.catListing'),
      beforeLabel: t('marketing.examples.lblMakersNote'),
      before: t('marketing.examples.ex3before'),
      after: t('marketing.examples.ex3after'),
      seconds: 33,
    },
    {
      title: t('marketing.examples.ex4title'),
      cat: 'posts',
      catLabel: t('marketing.examples.catInstagram'),
      beforeLabel: t('marketing.examples.lblMakersNote'),
      before: t('marketing.examples.ex4before'),
      after: t('marketing.examples.ex4after'),
      seconds: 22,
    },
    {
      title: t('marketing.examples.ex5title'),
      cat: 'posts',
      catLabel: t('marketing.examples.catInstagram'),
      beforeLabel: t('marketing.examples.lblMakersNote'),
      before: t('marketing.examples.ex5before'),
      after: t('marketing.examples.ex5after'),
      seconds: 24,
    },
    {
      title: t('marketing.examples.ex6title'),
      cat: 'posts',
      catLabel: t('marketing.examples.catPinterest'),
      beforeLabel: t('marketing.examples.lblMakersNote'),
      before: t('marketing.examples.ex6before'),
      after: t('marketing.examples.ex6after'),
      seconds: 27,
    },
    {
      title: t('marketing.examples.ex7title'),
      cat: 'replies',
      catLabel: t('marketing.examples.catBuyerReply'),
      beforeLabel: t('marketing.examples.lblBuyersMessage'),
      before: t('marketing.examples.ex7before'),
      after: t('marketing.examples.ex7after'),
      seconds: 14,
    },
    {
      title: t('marketing.examples.ex8title'),
      cat: 'replies',
      catLabel: t('marketing.examples.catReviewResponse'),
      beforeLabel: t('marketing.examples.lblReview'),
      before: t('marketing.examples.ex8before'),
      after: t('marketing.examples.ex8after'),
      seconds: 16,
    },
    {
      title: t('marketing.examples.ex9title'),
      cat: 'emails',
      catLabel: t('marketing.examples.catShippingNote'),
      beforeLabel: t('marketing.examples.lblMakersNote'),
      before: t('marketing.examples.ex9before'),
      after: t('marketing.examples.ex9after'),
      seconds: 15,
    },
    {
      title: t('marketing.examples.ex10title'),
      cat: 'emails',
      catLabel: t('marketing.examples.catNewsletter'),
      beforeLabel: t('marketing.examples.lblMakersNote'),
      before: t('marketing.examples.ex10before'),
      after: t('marketing.examples.ex10after'),
      seconds: 29,
    },
  ]

  const FILTERS = [
    { key: 'all', label: t('marketing.examples.fAll') },
    { key: 'listings', label: t('marketing.examples.fListings') },
    { key: 'posts', label: t('marketing.examples.fPosts') },
    { key: 'replies', label: t('marketing.examples.fReplies') },
    { key: 'emails', label: t('marketing.examples.fEmails') },
  ]

  const count = EXAMPLES.filter(
    (e) => filter === 'all' || e.cat === filter
  ).length

  const copy = (text: string, index: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopied(index)
          setTimeout(() => setCopied((c) => (c === index ? null : c)), 1600)
        },
        () => {}
      )
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="k-wrap k-page-head" style={{ paddingBottom: 36 }}>
          <div className="k-breadcrumb">
            <Link href="/">{t('marketing.examples.bcHome')}</Link> / {t('marketing.examples.bcCurrent')}
          </div>
          <div className="eyebrow">{t('marketing.examples.eyebrow')}</div>
          <h1 className="k-h1" style={{ marginTop: 16 }}>
            {t('marketing.examples.h1a')}
            <br />
            <span className="grad">{t('marketing.examples.h1grad')}</span>{' '}
            <em className="serif-accent">{t('marketing.examples.h1em')}</em>
          </h1>
          <p className="k-lead">{t('marketing.examples.lead')}</p>
          <div className="k-chips" style={{ marginTop: 34 }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`k-chip${filter === f.key ? ' on' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        <section className="k-wrap" style={{ paddingTop: 10 }}>
          <div className="k-grid k-g2">
            {EXAMPLES.map((e, i) => (
              <Reveal
                key={e.title}
                className="k-ex-card"
                delay={(i % 4) * 70}
                style={{
                  display: filter === 'all' || e.cat === filter ? undefined : 'none',
                }}
              >
                <div className="k-ex-head">
                  <h3>{e.title}</h3>
                  <span className={`k-cat ${e.cat}`}>{e.catLabel}</span>
                </div>
                <div className="k-half before">
                  <div className="k-lbl">{e.beforeLabel}</div>
                  <p>{e.before}</p>
                </div>
                <div className="k-half after">
                  <div className="k-lbl">{t('marketing.examples.lblCraftly')}</div>
                  <p>{e.after}</p>
                </div>
                <div className="k-ex-foot">
                  <span className="k-match">
                    {e.seconds} {t('marketing.examples.seconds')}
                  </span>
                  <button
                    type="button"
                    className="k-btn k-btn-sm"
                    onClick={() => copy(e.after, i)}
                  >
                    {copied === i ? t('marketing.examples.copied') : t('marketing.examples.copy')}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="k-empty" style={{ display: count ? 'none' : 'block' }}>
            {t('marketing.examples.empty')}
          </p>
          <p className="k-note">{t('marketing.examples.note')}</p>
        </section>

        <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
          <div className="k-stats">
            <Reveal className="k-stat">
              <CountUp target={10} suffix="" />
              <span>{t('marketing.examples.stat1')}</span>
            </Reveal>
            <Reveal className="k-stat">
              <CountUp target={38} suffix="s" />
              <span>{t('marketing.examples.stat2')}</span>
            </Reveal>
            <Reveal className="k-stat">
              <CountUp target={4200} suffix="+" />
              <span>{t('marketing.examples.stat3')}</span>
            </Reveal>
            <Reveal className="k-stat">
              <CountUp target={16} suffix="" />
              <span>{t('marketing.examples.stat4')}</span>
            </Reveal>
          </div>
        </section>

        <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
          <Reveal className="k-cta-band">
            <h2 className="k-h2">{t('marketing.examples.ctaH')}</h2>
            <p className="k-lead">{t('marketing.examples.ctaLead')}</p>
            <div className="k-cta-row">
              <Link href="/signup" className="k-btn k-btn-primary">
                <span>{t('marketing.examples.ctaBtn1')}</span>
                <i className="k-shine" />
              </Link>
              <Link href="/tools" className="k-btn">
                {t('marketing.examples.ctaBtn2')}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
