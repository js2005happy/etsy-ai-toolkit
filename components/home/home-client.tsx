'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Reveal from '@/components/shared/reveal'
import Faq from '@/components/shared/faq'
import { useI18n } from '@/lib/i18n/client'

function MarqueeItems() {
  return (
    <>
      Publishing: Etsy <i className="k-dot" /> Shopify <i className="k-dot" /> Content for: Amazon Handmade <i className="k-dot" /> Instagram <i className="k-dot" /> Pinterest <i className="k-dot" /> TikTok Shop <i className="k-dot" /> eBay <i className="k-dot" />
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

function demoOutput(note: string) {
  const normalized = note.trim().toLowerCase()
  if (normalized.includes('moon') || normalized.includes('silver')) {
    return {
      icon: '🌙',
      product: 'Sterling silver moon necklace',
      title: 'Handmade Sterling Silver Moon Pendant Necklace — Minimal Celestial Jewelry Gift',
      tags: ['moon necklace', 'sterling silver', 'celestial gift'],
      issues: ['Title is too generic', 'Important material missing', 'Tags can be more specific'],
    }
  }
  if (normalized.includes('mug') || normalized.includes('ceramic')) {
    return {
      icon: '☕',
      product: 'Sage green ceramic mug',
      title: 'Handmade Sage Green Ceramic Mug — Speckled 12 oz Pottery Cup',
      tags: ['ceramic mug', 'sage green mug', 'handmade pottery'],
      issues: ['Size is missing from title', 'Material can be clearer', 'Tags repeat broad terms'],
    }
  }
  return {
    icon: '✨',
    product: 'Handmade product',
    title: 'Handmade Product Listing — Clear Materials, Style and Gift Details',
    tags: ['handmade gift', 'small business', 'artisan made'],
    issues: ['Title needs more detail', 'Key attributes are missing', 'Tags can be more specific'],
  }
}

export default function HomeClient() {
  const { t } = useI18n()
  const [demoNote, setDemoNote] = useState('handmade ceramic mug, sage green, 12 oz, speckled glaze')
  const demo = useMemo(() => demoOutput(demoNote), [demoNote])

  return (
    <>
      <header className="k-wrap k-hero">
        <div className="k-hero-grid">
          <div>
            <div className="k-pill"><b>Craftly for Etsy sellers</b></div>
            <h1 className="k-h1-hero">
              Connect your Etsy shop.<br />
              <span className="grad">Find what needs fixing.</span>{' '}
              <em className="serif-accent">Improve listings.</em>
            </h1>
            <p className="k-sub">Craftly analyzes your Etsy listings, suggests improvements to titles, descriptions, tags and images, then lets you review every change before publishing.</p>
            <div className="k-cta-row">
              <Link href="/signup" className="k-btn k-btn-primary whitespace-nowrap"><span>Start free — no card</span><i className="k-shine" /></Link>
              <Link href="/tools/free-etsy-title-generator" className="k-btn">Try a free Etsy tool</Link>
            </div>
            <p className="k-trust">Review first. Publish only when you are ready.</p>
          </div>

          <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-2xl backdrop-blur md:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Listing workspace preview</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{demo.product}</p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">Review mode</span>
            </div>

            <div className="mt-5 grid grid-cols-[72px_1fr] gap-4">
              <div className="flex h-[72px] items-center justify-center rounded-2xl border border-border bg-background text-3xl" aria-hidden="true">{demo.icon}</div>
              <div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Listing health</p>
                    <p className="mt-1 text-2xl font-bold text-foreground"><span className="text-muted-foreground line-through decoration-muted-foreground/50">62</span> <span className="mx-1 text-muted-foreground">→</span> <span className="text-emerald-400">91</span></p>
                  </div>
                  <span className="text-xs text-muted-foreground">Example score</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[91%] rounded-full bg-primary" />
                </div>
              </div>
            </div>

            <label htmlFor="home-demo-note" className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Your rough note</label>
            <textarea
              id="home-demo-note"
              value={demoNote}
              onChange={(event) => setDemoNote(event.target.value.slice(0, 180))}
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Suggested title</p>
                <span className="text-xs text-muted-foreground">AI draft</span>
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
              <button type="button" className="k-btn k-btn-primary pointer-events-none"><span>Review changes</span></button>
              <button type="button" className="k-btn pointer-events-none">Publish to Etsy</button>
              <span className="text-xs text-muted-foreground">Example data · nothing publishes automatically</span>
            </div>
          </div>
        </div>
      </header>

      <div className="k-marquee">
        <div className="k-marquee-track"><span><MarqueeItems /></span><span><MarqueeItems /></span></div>
      </div>

      <section className="k-wrap k-section">
        <Reveal>
          <div className="eyebrow">See the difference</div>
          <h2 className="k-h2">From rough listing to review-ready.</h2>
          <p className="k-lead">Craftly gives sellers a clear before-and-after view so AI suggestions stay useful, editable and under your control.</p>
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal className="rounded-3xl border border-border bg-card/60 p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Before</span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Needs work</span>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Title</p>
            <p className="mt-2 text-lg font-semibold text-foreground">Handmade green mug gift ceramic cup</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/60 p-4"><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Listing health</p><p className="mt-2 text-3xl font-bold text-foreground">62</p></div>
              <div className="rounded-2xl border border-border bg-background/60 p-4"><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Issues found</p><p className="mt-2 text-3xl font-bold text-foreground">3</p></div>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li>• Product size is missing</li>
              <li>• Title reads like a keyword list</li>
              <li>• Tags are broad and repetitive</li>
            </ul>
          </Reveal>

          <Reveal className="rounded-3xl border border-primary/40 bg-primary/5 p-6 md:p-8" delay={80}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">After Craftly review</span>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-400">Ready to review</span>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Suggested title</p>
            <p className="mt-2 text-lg font-semibold text-foreground">Handmade Sage Green Ceramic Mug — Speckled 12 oz Pottery Cup</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary/20 bg-background/60 p-4"><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Example health</p><p className="mt-2 text-3xl font-bold text-emerald-400">91</p></div>
              <div className="rounded-2xl border border-primary/20 bg-background/60 p-4"><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Publishing</p><p className="mt-2 text-base font-bold text-foreground">Your approval only</p></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['ceramic mug', 'sage green mug', 'handmade pottery', '12 oz mug'].map((tag) => <span key={tag} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">{tag}</span>)}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">Illustrative example only. Craftly does not guarantee Etsy ranking, traffic or sales.</p>
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
            {[
              ['Find problems', 'Listing health surfaces the places worth reviewing.'],
              ['Fix with AI', 'Draft clearer titles, descriptions, tags and seller content.'],
              ['Review safely', 'Nothing changes remotely until you approve it.'],
              ['Publish', 'Push approved work to Etsy from the same workspace.'],
            ].map(([title, body], index) => (
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
          <div className="k-cta-row"><Link href="/signup" className="k-btn k-btn-primary whitespace-nowrap"><span>Start free — no card</span><i className="k-shine" /></Link><Link href="/how-it-works" className="k-btn">{t('home.cta.btn2')}</Link></div>
        </Reveal>
      </section>
    </>
  )
}
