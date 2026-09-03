'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar'
import SiteFooter from '@/components/shared/site-footer'
import Reveal from '@/components/shared/reveal'
import { useI18n } from '@/lib/i18n/client'

type Tool = {
  n: string
  cat: 'write' | 'sell' | 'support' | 'grow'
  title: string
  desc: string
  popular?: boolean
}

export default function ToolsPage() {
  const { t } = useI18n()
  const [filter, setFilter] = useState('all')

  const TOOLS: Tool[] = [
    { n: '01', cat: 'write', title: t('marketing.tools.tool1title'), desc: t('marketing.tools.tool1desc'), popular: true },
    { n: '02', cat: 'write', title: t('marketing.tools.tool2title'), desc: t('marketing.tools.tool2desc') },
    { n: '03', cat: 'write', title: t('marketing.tools.tool3title'), desc: t('marketing.tools.tool3desc') },
    { n: '04', cat: 'sell', title: t('marketing.tools.tool4title'), desc: t('marketing.tools.tool4desc') },
    { n: '05', cat: 'sell', title: t('marketing.tools.tool5title'), desc: t('marketing.tools.tool5desc') },
    { n: '06', cat: 'sell', title: t('marketing.tools.tool6title'), desc: t('marketing.tools.tool6desc') },
    { n: '07', cat: 'sell', title: t('marketing.tools.tool7title'), desc: t('marketing.tools.tool7desc') },
    { n: '08', cat: 'sell', title: t('marketing.tools.tool8title'), desc: t('marketing.tools.tool8desc') },
    { n: '09', cat: 'sell', title: t('marketing.tools.tool9title'), desc: t('marketing.tools.tool9desc') },
    { n: '10', cat: 'support', title: t('marketing.tools.tool10title'), desc: t('marketing.tools.tool10desc') },
    { n: '11', cat: 'support', title: t('marketing.tools.tool11title'), desc: t('marketing.tools.tool11desc') },
    { n: '12', cat: 'support', title: t('marketing.tools.tool12title'), desc: t('marketing.tools.tool12desc') },
    { n: '13', cat: 'grow', title: t('marketing.tools.tool13title'), desc: t('marketing.tools.tool13desc') },
    { n: '14', cat: 'grow', title: t('marketing.tools.tool14title'), desc: t('marketing.tools.tool14desc') },
    { n: '15', cat: 'grow', title: t('marketing.tools.tool15title'), desc: t('marketing.tools.tool15desc') },
    { n: '16', cat: 'grow', title: t('marketing.tools.tool16title'), desc: t('marketing.tools.tool16desc') },
  ]

  const FILTERS = [
    { key: 'all', label: t('marketing.tools.fAll') },
    { key: 'write', label: t('marketing.tools.fWrite') },
    { key: 'sell', label: t('marketing.tools.fSell') },
    { key: 'support', label: t('marketing.tools.fSupport') },
    { key: 'grow', label: t('marketing.tools.fGrow') },
  ]

  const catLabels: Record<Tool['cat'], string> = {
    write: t('marketing.tools.fWrite'),
    sell: t('marketing.tools.fSell'),
    support: t('marketing.tools.fSupport'),
    grow: t('marketing.tools.fGrow'),
  }

  const count = TOOLS.filter((t) => filter === 'all' || t.cat === filter).length

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="k-wrap k-page-head" style={{ paddingBottom: 34 }}>
          <div className="k-breadcrumb">
            <Link href="/">{t('marketing.tools.bcHome')}</Link> / {t('marketing.tools.bcCurrent')}
          </div>
          <div className="eyebrow">{t('marketing.tools.eyebrow')}</div>
          <h1 className="k-h1" style={{ marginTop: 16 }}>
            {t('marketing.tools.h1a')}
            <br />
            <span className="grad">{t('marketing.tools.h1grad')}</span>
          </h1>
          <p className="k-lead">{t('marketing.tools.lead')}</p>
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
          <div className="k-grid k-g3">
            {TOOLS.map((tool, i) => (
              <Reveal
                key={tool.n}
                href="/dashboard"
                className="k-tool-card"
                delay={(i % 4) * 70}
                style={{
                  display: filter === 'all' || tool.cat === filter ? undefined : 'none',
                }}
              >
                {tool.popular && <span className="k-hot">{t('marketing.tools.popular')}</span>}
                <div className="k-tool-top">
                  <div className="k-ico">{tool.n}</div>
                  <span className={`k-cat ${tool.cat}`}>{catLabels[tool.cat]}</span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
                <div className="k-go">{t('marketing.tools.openInWorkspace')}</div>
              </Reveal>
            ))}
          </div>
          <p className="k-empty" style={{ display: count ? 'none' : 'block' }}>
            {t('marketing.tools.empty')}
          </p>
        </section>

        <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
          <Reveal className="k-cta-band">
            <h2 className="k-h2">{t('marketing.tools.ctaH')}</h2>
            <p className="k-lead">{t('marketing.tools.ctaLead')}</p>
            <div className="k-cta-row">
              <Link href="/dashboard" className="k-btn k-btn-primary">
                <span>{t('marketing.tools.ctaBtn1')}</span>
                <i className="k-shine" />
              </Link>
              <Link href="/pricing" className="k-btn">
                {t('marketing.tools.ctaBtn2')}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
