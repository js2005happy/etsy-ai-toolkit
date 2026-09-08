'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Reveal from '@/components/shared/reveal'
import Faq from '@/components/shared/faq'
import { useI18n } from '@/lib/i18n/client'
import { PLANS } from '@/lib/pricing'

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
      title: 'Handmade Sterling Silver Moon Pendant Necklace — Minimal Celestial Jewelry Gift',
      tags: ['moon necklace', 'sterling silver', 'celestial gift'],
    }
  }
  if (normalized.includes('mug') || normalized.includes('ceramic')) {
    return {
      title: 'Handmade Sage Green Ceramic Mug — Speckled 12 oz Pottery Cup',
      tags: ['ceramic mug', 'sage green mug', 'handmade pottery'],
    }
  }
  return {
    title: 'Handmade Product Listing — Clear Materials, Style and Gift Details',
    tags: ['handmade gift', 'small business', 'artisan made'],
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

          <div className="k-fcard" style={{ position: 'relative', inset: 'auto', transform: 'none', width: '100%', maxWidth: 520 }}>
            <div className="k-lbl">YOUR ROUGH NOTE</div>
            <label htmlFor="home-demo-note" className="sr-only">Try a product note</label>
            <textarea
              id="home-demo-note"
              value={demoNote}
              onChange={(event) => setDemoNote(event.target.value.slice(0, 180))}
              rows={4}
              className="mt-3 w-full resize-none rounded-lg border border-border bg-background/70 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="my-4 text-center text-muted-foreground" aria-hidden="true">↓</div>
            <div className="k-lbl">CRAFTLY EXAMPLE</div>
            <h4 className="mt-2">{demo.title}</h4>
            <div className="k-tag-row mt-3">
              {demo.tags.map((tag) => <span key={tag} className="k-tag">{tag}</span>)}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Interactive example — no AI call or credits used.</p>
          </div>
        </div>
      </header>

      <div className="k-marquee">
        <div className="k-marquee-track"><span><MarqueeItems /></span><span><MarqueeItems /></span></div>
      </div>

      <section className="k-wrap k-section">
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
        <div className="k-grid k-g3" style={{ marginTop: 58 }}>
          {PLANS.map((plan) => <Reveal className="k-cell" key={plan.id}><h3>{plan.name}</h3><p>{plan.credits} credits · {plan.imageCredits} image credits</p></Reveal>)}
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
