'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Reveal from '@/components/shared/reveal'
import Faq from '@/components/shared/faq'
import { useI18n } from '@/lib/i18n/client'
import { HOME_REVIEW_COPY } from '@/components/home/home-review-copy'

type HomeCopy = (typeof HOME_REVIEW_COPY)['en']

function MarqueeItems({ copy }: { copy: HomeCopy }) {
  return (
    <>
      {copy.publishing} Etsy <i className="k-dot" /> Shopify <i className="k-dot" /> {copy.contentFor} Amazon Handmade <i className="k-dot" /> Instagram <i className="k-dot" /> Pinterest <i className="k-dot" /> TikTok Shop <i className="k-dot" /> eBay <i className="k-dot" />
    </>
  )
}

const HOME_MARKETS = [
  { flag: '🇩🇪', rank: '01', country: 'Deutschland', lang: 'Deutsch', line: 'Starke Handwerks-Nachfrage — Angebote, die lokal wirken.' },
  { flag: '🇫🇷', rank: '02', country: 'France', lang: 'Français', line: 'Forte demande artisanale — des fiches qui sonnent locales.' },
  { flag: '🇯🇵', rank: '03', country: '日本', lang: '日本語', line: 'クラフト需要が強い — 現地らしい商品説明。' },
  { flag: '🇰🇷', rank: '04', country: '한국', lang: '한국어', line: '공예 수요가 크다 — 현지감 있는 상품설명.' },
  { flag: '🇪🇸', rank: '05', country: 'España', lang: 'Español', line: 'Alta demanda artesanal — fichas que suenan locales.' },
  { flag: '🇮🇹', rank: '06', country: 'Italia', lang: 'Italiano', line: 'Forte domanda artigianale — inserzioni che suonano locali.' },
  { flag: '🇧🇷', rank: '07', country: 'Brasil', lang: 'Português', line: 'Alta procura artesanal — anúncios que soam locais.' },
]

function demoOutput(note: string, copy: HomeCopy) {
  const normalized = note.trim().toLowerCase()
  if (normalized.includes('moon') || normalized.includes('silver') || normalized.includes('月') || normalized.includes('银')) {
    return { icon: '🌙', ...copy.moon }
  }
  if (normalized.includes('mug') || normalized.includes('ceramic') || normalized.includes('杯') || normalized.includes('陶瓷')) {
    return { icon: '☕', ...copy.mug }
  }
  return { icon: '✨', ...copy.generic }
}

export default function HomeClient() {
  const { t, locale } = useI18n()
  const copy = HOME_REVIEW_COPY[locale]
  const [demoNote, setDemoNote] = useState(copy.demoNote)

  useEffect(() => {
    setDemoNote(copy.demoNote)
  }, [copy.demoNote])

  const demo = useMemo(() => demoOutput(demoNote, copy), [demoNote, copy])

  return (
    <>
      <header className="k-wrap k-hero">
        <div className="k-hero-grid">
          <div>
            <div className="k-pill"><b>{copy.pill}</b></div>
            <h1 className="k-h1-hero">
              {copy.heroA}<br />
              <span className="grad">{copy.heroB}</span>{' '}
              <em className="serif-accent">{copy.heroC}</em>
            </h1>
            <p className="k-sub">{copy.heroSub}</p>
            <div className="k-cta-row">
              <Link href="/signup" className="k-btn k-btn-primary whitespace-nowrap"><span>{copy.startFree}</span><i className="k-shine" /></Link>
              <Link href="/tools/free-etsy-title-generator" className="k-btn">{copy.tryTool}</Link>
            </div>
            <p className="k-trust">{copy.trust}</p>
          </div>

          <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-2xl backdrop-blur md:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{copy.workspacePreview}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{demo.product}</p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">{copy.reviewMode}</span>
            </div>

            <div className="mt-5 grid grid-cols-[72px_1fr] gap-4">
              <div className="flex h-[72px] items-center justify-center rounded-2xl border border-border bg-background text-3xl" aria-hidden="true">{demo.icon}</div>
              <div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{copy.listingHealth}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground"><span className="text-muted-foreground line-through decoration-muted-foreground/50">62</span> <span className="mx-1 text-muted-foreground">→</span> <span className="text-emerald-400">91</span></p>
                  </div>
                  <span className="text-xs text-muted-foreground">{copy.exampleScore}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[91%] rounded-full bg-primary" /></div>
              </div>
            </div>

            <label htmlFor="home-demo-note" className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{copy.roughNote}</label>
            <textarea id="home-demo-note" value={demoNote} onChange={(event) => setDemoNote(event.target.value.slice(0, 180))} rows={3} className="mt-2 w-full resize-none rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />

            <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{copy.suggestedTitle}</p>
                <span className="text-xs text-muted-foreground">{copy.aiDraft}</span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">{demo.title}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {demo.tags.map((tag) => <span key={tag} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">{tag}</span>)}
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {demo.issues.map((issue) => <div key={issue} className="rounded-xl border border-border bg-background/70 px-3 py-2 text-xs leading-relaxed text-muted-foreground">{issue}</div>)}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" className="k-btn k-btn-primary pointer-events-none"><span>{copy.reviewChanges}</span></button>
              <button type="button" className="k-btn pointer-events-none">{copy.publishToEtsy}</button>
              <span className="text-xs text-muted-foreground">{copy.exampleData}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="k-marquee">
        <div className="k-marquee-track"><span><MarqueeItems copy={copy} /></span><span><MarqueeItems copy={copy} /></span></div>
      </div>

      <section className="k-wrap k-section">
        <Reveal>
          <div className="eyebrow">{copy.seeDifference}</div>
          <h2 className="k-h2">{copy.differenceHeading}</h2>
          <p className="k-lead">{copy.differenceLead}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal className="rounded-3xl border border-border bg-card/60 p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{copy.before}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{copy.needsWork}</span>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{copy.title}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{copy.beforeTitle}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/60 p-4"><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{copy.listingHealth}</p><p className="mt-2 text-3xl font-bold text-foreground">62</p></div>
              <div className="rounded-2xl border border-border bg-background/60 p-4"><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{copy.issuesFound}</p><p className="mt-2 text-3xl font-bold text-foreground">3</p></div>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">{copy.beforeIssues.map((issue) => <li key={issue}>• {issue}</li>)}</ul>
          </Reveal>

          <Reveal className="rounded-3xl border border-primary/40 bg-primary/5 p-6 md:p-8" delay={80}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{copy.afterReview}</span>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-400">{copy.readyToReview}</span>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{copy.suggestedTitle}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{copy.mug.title}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary/20 bg-background/60 p-4"><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{copy.exampleHealth}</p><p className="mt-2 text-3xl font-bold text-emerald-400">91</p></div>
              <div className="rounded-2xl border border-primary/20 bg-background/60 p-4"><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{copy.publishingLabel}</p><p className="mt-2 text-base font-bold text-foreground">{copy.approvalOnly}</p></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">{copy.mug.tags.map((tag) => <span key={tag} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">{tag}</span>)}</div>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{copy.disclaimer}</p>
          </Reveal>
        </div>
      </section>

      <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
        <Reveal><div className="eyebrow">{t('home.feat.eyebrow')}</div><h2 className="k-h2">{t('home.feat.heading')}</h2><p className="k-lead">{t('home.feat.lead')}</p></Reveal>
        <div className="k-grid k-g3" style={{ marginTop: 52 }}>
          <Reveal className="k-cell wide" delay={0}><div className="k-ico">01</div><h3>{t('home.feat1.title')}</h3><p>{t('home.feat1.desc')}</p></Reveal>
          <Reveal className="k-cell" delay={70}><div className="k-ico">02</div><h3>{t('home.feat2.title')}</h3><p>{t('home.feat2.desc')}</p></Reveal>
          <Reveal className="k-cell" delay={140}><div className="k-ico">03</div><h3>{t('home.feat3.title')}</h3><p>{t('home.feat3.desc')}</p></Reveal>
          <Reveal className="k-cell" delay={210}><div className="k-ico">04</div><h3>{t('home.feat4.title')}</h3><p>{t('home.feat4.desc')}</p></Reveal>
          <Reveal className="k-cell wide" delay={0}><div className="k-ico">05</div><h3>{t('home.feat5.title')}</h3><p>{t('home.feat5.desc')}</p></Reveal>
        </div>
      </section>

      <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
        <Reveal><div className="eyebrow">{t('home.how.eyebrow')}</div><h2 className="k-h2">{t('home.how.heading')}</h2></Reveal>
        <div className="k-steps">
          <Reveal className="k-step"><div className="k-num">1</div><h4>{t('home.step1.title')}</h4><p>{t('home.step1.desc')}</p></Reveal>
          <Reveal className="k-step"><div className="k-num">2</div><h4>{t('home.step2.title')}</h4><p>{t('home.step2.desc')}</p></Reveal>
          <Reveal className="k-step"><div className="k-num">3</div><h4>{t('home.step3.title')}</h4><p>{t('home.step3.desc')}</p></Reveal>
        </div>
        <Reveal className="mt-10 rounded-3xl border border-border bg-card/60 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-4">
            {copy.process.map(([title, body], index) => (
              <div key={title}>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">0{index + 1}</span>
                <h3 className="mt-2 text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="eyebrow">{t('home.mk.eyebrow')}</div>
          <h2 className="k-h2">{t('home.mk.heading')}</h2>
          <p className="k-lead">{t('home.mk.lead')}</p>
        </Reveal>
        <div className="k-mk-grid">
          {HOME_MARKETS.map((m, i) => (
            <Reveal key={m.rank} className="k-mk" delay={i * 60}>
              <div className="k-rank">{m.rank}</div><div className="k-flag">{m.flag}</div><div className="k-country">{m.country}</div><div className="k-lang">{m.lang}</div><div className="k-line">{m.line}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
        <Reveal><div className="eyebrow">{t('home.faq.eyebrow')}</div><h2 className="k-h2">{t('home.faq.heading')}</h2></Reveal>
        <Faq items={[
          { q: t('home.faq1.q'), a: t('home.faq1.a') },
          { q: t('home.faq2.q'), a: t('home.faq2.a') },
          { q: t('home.faq3.q'), a: t('home.faq3.a') },
          { q: t('home.faq4.q'), a: t('home.faq4.a') },
        ]} />
        <Reveal className="k-cta-band" style={{ marginTop: 80 }}>
          <h2 className="k-h2">{t('home.cta.h1')}</h2><p className="k-lead">{t('home.cta.lead')}</p>
          <div className="k-cta-row"><Link href="/signup" className="k-btn k-btn-primary whitespace-nowrap"><span>{copy.startFree}</span><i className="k-shine" /></Link><Link href="/how-it-works" className="k-btn">{t('home.cta.btn2')}</Link></div>
        </Reveal>
      </section>
    </>
  )
}
