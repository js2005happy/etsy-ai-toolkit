'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Reveal from '@/components/shared/reveal'
import CountUp from '@/components/shared/count-up'
import Faq from '@/components/shared/faq'
import {
  HOME_LOCALES,
  HOME_MARKETS,
  DEFAULT_HOME_LOCALE,
  isHomeLocale,
  translate,
} from '@/lib/home-i18n'
import type { HomeLocale } from '@/lib/home-i18n'

const LANG_KEY = 'craftly-lang'

function MarqueeItems() {
  return (
    <>
      Etsy <i className="k-dot" /> Shopify <i className="k-dot" /> Amazon
      Handmade <i className="k-dot" /> Instagram <i className="k-dot" />{' '}
      Pinterest <i className="k-dot" /> TikTok Shop <i className="k-dot" /> eBay{' '}
      <i className="k-dot" />
    </>
  )
}

export default function HomeClient() {
  const [locale, setLocale] = useState<HomeLocale>(DEFAULT_HOME_LOCALE)

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved && isHomeLocale(saved)) setLocale(saved)
  }, [])

  const changeLocale = (code: HomeLocale) => {
    setLocale(code)
    localStorage.setItem(LANG_KEY, code)
  }

  const t = (key: string) => translate(locale, key)

  const stats: { target: number; suffix: string; label: string }[] = [
    { target: 4200, suffix: '+', label: t('stat1') },
    { target: 96, suffix: '%', label: t('stat2') },
    { target: 11, suffix: 'x', label: t('stat3') },
    { target: 40, suffix: '', label: t('stat4') },
  ]

  return (
    <>
      {/* hero */}
      <header className="k-wrap k-hero">
        <div className="k-langs" role="group" aria-label="Language">
          {HOME_LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              className={locale === l.code ? 'active' : ''}
              onClick={() => changeLocale(l.code)}
              aria-pressed={locale === l.code}
            >
              <span className="k-fl">{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>

        <div className="k-hero-grid">
          <div>
            <div className="k-pill">
              <b>{t('hero.badge')}</b> {t('hero.pill')}
            </div>
            <h1 className="k-h1-hero">
              {t('hero.h1_pre')}
              <br />
              <span className="grad">{t('hero.h1_grad')}</span>{' '}
              <em className="serif-accent">{t('hero.h1_em')}</em>
            </h1>
            <p className="k-sub">{t('hero.sub')}</p>
            <div className="k-cta-row">
              <Link href="/signup" className="k-btn k-btn-primary">
                <span>{t('hero.cta1')}</span>
                <i className="k-shine" />
              </Link>
              <Link href="/how-it-works" className="k-btn">
                {t('hero.cta2')}
              </Link>
            </div>
            <p className="k-trust">{t('hero.trust')}</p>
          </div>

          <div className="k-stack">
            <div className="k-fcard k-c1">
              <h4>{t('card1.title')}</h4>
              <p>{t('card1.body')}</p>
              <div className="k-tag-row">
                <span className="k-tag">{t('card1.tag1')}</span>
                <span className="k-tag">{t('card1.tag2')}</span>
              </div>
            </div>
            <div className="k-fcard k-c2">
              <h4>{t('card2.title')}</h4>
              <p>{t('card2.body')}</p>
              <div className="k-meter">
                <i />
              </div>
            </div>
            <div className="k-fcard k-c3">
              <h4>{t('card3.title')}</h4>
              <p>{t('card3.body')}</p>
              <div className="k-tag-row">
                <span className="k-tag">Etsy</span>
                <span className="k-tag">Shopify</span>
                <span className="k-tag">Instagram</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* marquee */}
      <div className="k-marquee">
        <div className="k-marquee-track">
          <span>
            <MarqueeItems />
          </span>
          <span>
            <MarqueeItems />
          </span>
        </div>
      </div>

      {/* markets — seven-language exhibit */}
      <section className="k-wrap k-section">
        <Reveal>
          <div className="eyebrow">{t('mk.eyebrow')}</div>
          <h2 className="k-h2">{t('mk.heading')}</h2>
          <p className="k-lead">{t('mk.lead')}</p>
        </Reveal>
        <div className="k-mk-grid">
          {HOME_MARKETS.map((m, i) => (
            <Reveal key={m.rank} className="k-mk" delay={i * 60}>
              <div className="k-rank">{m.rank}</div>
              <div className="k-flag">{m.flag}</div>
              <div className="k-country">{m.country}</div>
              <div className="k-lang">{m.lang}</div>
              <div className="k-line">{m.line}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="eyebrow">{t('feat.eyebrow')}</div>
          <h2 className="k-h2">{t('feat.heading')}</h2>
          <p className="k-lead">{t('feat.lead')}</p>
        </Reveal>
        <div className="k-grid k-g3" style={{ marginTop: 52 }}>
          <Reveal className="k-cell wide" delay={0}>
            <div className="k-ico">01</div>
            <h3>{t('feat1.title')}</h3>
            <p>{t('feat1.desc')}</p>
          </Reveal>
          <Reveal className="k-cell" delay={70}>
            <div className="k-ico">02</div>
            <h3>{t('feat2.title')}</h3>
            <p>{t('feat2.desc')}</p>
          </Reveal>
          <Reveal className="k-cell" delay={140}>
            <div className="k-ico">03</div>
            <h3>{t('feat3.title')}</h3>
            <p>{t('feat3.desc')}</p>
          </Reveal>
          <Reveal className="k-cell" delay={210}>
            <div className="k-ico">04</div>
            <h3>{t('feat4.title')}</h3>
            <p>{t('feat4.desc')}</p>
          </Reveal>
          <Reveal className="k-cell wide" delay={0}>
            <div className="k-ico">05</div>
            <h3>{t('feat5.title')}</h3>
            <p>{t('feat5.desc')}</p>
          </Reveal>
        </div>
      </section>

      {/* how it works */}
      <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="eyebrow">{t('how.eyebrow')}</div>
          <h2 className="k-h2">{t('how.heading')}</h2>
        </Reveal>
        <div className="k-steps">
          <Reveal className="k-step">
            <div className="k-num">1</div>
            <h4>{t('step1.title')}</h4>
            <p>{t('step1.desc')}</p>
          </Reveal>
          <Reveal className="k-step">
            <div className="k-num">2</div>
            <h4>{t('step2.title')}</h4>
            <p>{t('step2.desc')}</p>
          </Reveal>
          <Reveal className="k-step">
            <div className="k-num">3</div>
            <h4>{t('step3.title')}</h4>
            <p>{t('step3.desc')}</p>
          </Reveal>
        </div>
        <div className="k-stats" style={{ marginTop: 58 }}>
          {stats.map((s, i) => (
            <Reveal className="k-stat" key={i}>
              <CountUp target={s.target} suffix={s.suffix} />
              <span>{s.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* faq + cta */}
      <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="eyebrow">{t('faq.eyebrow')}</div>
          <h2 className="k-h2">{t('faq.heading')}</h2>
        </Reveal>
        <Faq
          items={[
            { q: t('faq1.q'), a: t('faq1.a') },
            { q: t('faq2.q'), a: t('faq2.a') },
            { q: t('faq3.q'), a: t('faq3.a') },
            { q: t('faq4.q'), a: t('faq4.a') },
          ]}
        />
        <Reveal className="k-cta-band" style={{ marginTop: 80 }}>
          <h2 className="k-h2">{t('cta.h1')}</h2>
          <p className="k-lead">{t('cta.lead')}</p>
          <div className="k-cta-row">
            <Link href="/signup" className="k-btn k-btn-primary">
              <span>{t('cta.btn1')}</span>
              <i className="k-shine" />
            </Link>
            <Link href="/how-it-works" className="k-btn">
              {t('cta.btn2')}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
