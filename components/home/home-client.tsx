'use client'

import Link from 'next/link'
import Reveal from '@/components/shared/reveal'
import CountUp from '@/components/shared/count-up'
import Faq from '@/components/shared/faq'
import { useI18n } from '@/lib/i18n/client'

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

// 七国市场 —— 永远用本国文字渲染（展示品本身，不跟随语言切换）
const HOME_MARKETS = [
  { flag: '🇩🇪', rank: '01', country: 'Deutschland', lang: 'Deutsch', line: 'Starke Handwerks-Nachfrage — Angebote, die lokal wirken.' },
  { flag: '🇫🇷', rank: '02', country: 'France', lang: 'Français', line: 'Forte demande artisanale — des fiches qui sonnent locales.' },
  { flag: '🇯🇵', rank: '03', country: '日本', lang: '日本語', line: 'クラフト需要が強い — 現地らしい商品説明。' },
  { flag: '🇰🇷', rank: '04', country: '한국', lang: '한국어', line: '공예 수요가 크다 — 현지감 있는 상품설명.' },
  { flag: '🇪🇸', rank: '05', country: 'España', lang: 'Español', line: 'Alta demanda artesanal — fichas que suenan locales.' },
  { flag: '🇮🇹', rank: '06', country: 'Italia', lang: 'Italiano', line: 'Forte domanda artigianale — inserzioni che suonano locali.' },
  { flag: '🇧🇷', rank: '07', country: 'Brasil', lang: 'Português', line: 'Alta procura artesanal — anúncios que soam locais.' },
]

export default function HomeClient() {
  const { t } = useI18n()

  const stats: { target: number; suffix: string; label: string }[] = [
    { target: 4200, suffix: '+', label: t('home.stat1') },
    { target: 96, suffix: '%', label: t('home.stat2') },
    { target: 11, suffix: 'x', label: t('home.stat3') },
    { target: 40, suffix: '', label: t('home.stat4') },
  ]

  return (
    <>
      {/* hero */}
      <header className="k-wrap k-hero">
        <div className="k-hero-grid">
          <div>
            <div className="k-pill">
              <b>{t('home.hero.badge')}</b> {t('home.hero.pill')}
            </div>
            <h1 className="k-h1-hero">
              {t('home.hero.h1_pre')}
              <br />
              <span className="grad">{t('home.hero.h1_grad')}</span>{' '}
              <em className="serif-accent">{t('home.hero.h1_em')}</em>
            </h1>
            <p className="k-sub">{t('home.hero.sub')}</p>
            <div className="k-cta-row">
              <Link href="/signup" className="k-btn k-btn-primary">
                <span>{t('home.hero.cta1')}</span>
                <i className="k-shine" />
              </Link>
              <Link href="/how-it-works" className="k-btn">
                {t('home.hero.cta2')}
              </Link>
            </div>
            <p className="k-trust">{t('home.hero.trust')}</p>
          </div>

          <div className="k-stack">
            <div className="k-fcard k-c1">
              <h4>{t('home.card1.title')}</h4>
              <p>{t('home.card1.body')}</p>
              <div className="k-tag-row">
                <span className="k-tag">{t('home.card1.tag1')}</span>
                <span className="k-tag">{t('home.card1.tag2')}</span>
              </div>
            </div>
            <div className="k-fcard k-c2">
              <h4>{t('home.card2.title')}</h4>
              <p>{t('home.card2.body')}</p>
              <div className="k-meter">
                <i />
              </div>
            </div>
            <div className="k-fcard k-c3">
              <h4>{t('home.card3.title')}</h4>
              <p>{t('home.card3.body')}</p>
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
          <div className="eyebrow">{t('home.mk.eyebrow')}</div>
          <h2 className="k-h2">{t('home.mk.heading')}</h2>
          <p className="k-lead">{t('home.mk.lead')}</p>
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
          <div className="eyebrow">{t('home.feat.eyebrow')}</div>
          <h2 className="k-h2">{t('home.feat.heading')}</h2>
          <p className="k-lead">{t('home.feat.lead')}</p>
        </Reveal>
        <div className="k-grid k-g3" style={{ marginTop: 52 }}>
          <Reveal className="k-cell wide" delay={0}>
            <div className="k-ico">01</div>
            <h3>{t('home.feat1.title')}</h3>
            <p>{t('home.feat1.desc')}</p>
          </Reveal>
          <Reveal className="k-cell" delay={70}>
            <div className="k-ico">02</div>
            <h3>{t('home.feat2.title')}</h3>
            <p>{t('home.feat2.desc')}</p>
          </Reveal>
          <Reveal className="k-cell" delay={140}>
            <div className="k-ico">03</div>
            <h3>{t('home.feat3.title')}</h3>
            <p>{t('home.feat3.desc')}</p>
          </Reveal>
          <Reveal className="k-cell" delay={210}>
            <div className="k-ico">04</div>
            <h3>{t('home.feat4.title')}</h3>
            <p>{t('home.feat4.desc')}</p>
          </Reveal>
          <Reveal className="k-cell wide" delay={0}>
            <div className="k-ico">05</div>
            <h3>{t('home.feat5.title')}</h3>
            <p>{t('home.feat5.desc')}</p>
          </Reveal>
        </div>
      </section>

      {/* how it works */}
      <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="eyebrow">{t('home.how.eyebrow')}</div>
          <h2 className="k-h2">{t('home.how.heading')}</h2>
        </Reveal>
        <div className="k-steps">
          <Reveal className="k-step">
            <div className="k-num">1</div>
            <h4>{t('home.step1.title')}</h4>
            <p>{t('home.step1.desc')}</p>
          </Reveal>
          <Reveal className="k-step">
            <div className="k-num">2</div>
            <h4>{t('home.step2.title')}</h4>
            <p>{t('home.step2.desc')}</p>
          </Reveal>
          <Reveal className="k-step">
            <div className="k-num">3</div>
            <h4>{t('home.step3.title')}</h4>
            <p>{t('home.step3.desc')}</p>
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
          <div className="eyebrow">{t('home.faq.eyebrow')}</div>
          <h2 className="k-h2">{t('home.faq.heading')}</h2>
        </Reveal>
        <Faq
          items={[
            { q: t('home.faq1.q'), a: t('home.faq1.a') },
            { q: t('home.faq2.q'), a: t('home.faq2.a') },
            { q: t('home.faq3.q'), a: t('home.faq3.a') },
            { q: t('home.faq4.q'), a: t('home.faq4.a') },
          ]}
        />
        <Reveal className="k-cta-band" style={{ marginTop: 80 }}>
          <h2 className="k-h2">{t('home.cta.h1')}</h2>
          <p className="k-lead">{t('home.cta.lead')}</p>
          <div className="k-cta-row">
            <Link href="/signup" className="k-btn k-btn-primary">
              <span>{t('home.cta.btn1')}</span>
              <i className="k-shine" />
            </Link>
            <Link href="/how-it-works" className="k-btn">
              {t('home.cta.btn2')}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
