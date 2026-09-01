'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar'
import SiteFooter from '@/components/shared/site-footer'
import Reveal from '@/components/shared/reveal'

type Tool = {
  n: string
  cat: 'write' | 'sell' | 'support' | 'grow'
  title: string
  desc: string
  popular?: boolean
}

const TOOLS: Tool[] = [
  {
    n: '01',
    cat: 'write',
    title: 'Listing Writer',
    desc: 'Turn rough notes and photos into a complete listing: title, description, and materials, in your words.',
    popular: true,
  },
  {
    n: '02',
    cat: 'write',
    title: 'Title Optimizer',
    desc: 'Ten title variants ranked by search intent and readability. Keep the one that sounds most like you.',
  },
  {
    n: '03',
    cat: 'write',
    title: 'Tag Generator',
    desc: 'Thirteen tags drawn from how real buyers search, not from a thesaurus. No stuffing, no filler.',
  },
  {
    n: '04',
    cat: 'write',
    title: 'Variant Copy',
    desc: 'Twelve colourways, one description template. Change the glaze name, keep the voice intact.',
  },
  {
    n: '05',
    cat: 'write',
    title: 'Photo Captions',
    desc: 'Alt text and photo captions that describe the piece honestly — and help it get found.',
  },
  {
    n: '06',
    cat: 'sell',
    title: 'Etsy SEO Audit',
    desc: 'Paste a live listing. Get a plain-language score and the three edits that move it most.',
  },
  {
    n: '07',
    cat: 'sell',
    title: 'Shopify Page Copy',
    desc: "Product pages with a short opening line, honest specs, and a closing nudge that isn't pushy.",
  },
  {
    n: '08',
    cat: 'sell',
    title: 'Amazon Bullets',
    desc: 'Five benefit bullets written in plain speech, stripped of the usual marketplace shouting.',
  },
  {
    n: '09',
    cat: 'sell',
    title: 'Shop Announcement',
    desc: 'Holiday hours, a kiln delay, a restock — announced warmly, in two sentences.',
  },
  {
    n: '10',
    cat: 'support',
    title: 'Buyer Reply',
    desc: 'Answer sizing, shipping, and custom-order questions using your own policies and past replies.',
  },
  {
    n: '11',
    cat: 'support',
    title: 'Review Response',
    desc: 'Thank people properly. Handle a three-star review without defensiveness or corporate speak.',
  },
  {
    n: '12',
    cat: 'support',
    title: 'Shipping Note',
    desc: 'A short dispatch message with tracking, care instructions, and a human sign-off.',
  },
  {
    n: '13',
    cat: 'grow',
    title: 'Instagram Caption',
    desc: 'Three caption options per photo: a story, a short one, and a question that invites replies.',
  },
  {
    n: '14',
    cat: 'grow',
    title: 'Pinterest Pin',
    desc: 'Keyword-rich pin titles and descriptions that still read like a person wrote them.',
  },
  {
    n: '15',
    cat: 'grow',
    title: 'Newsletter Blurb',
    desc: 'A paragraph for your email list that sounds like the note you would actually send.',
  },
]

const FILTERS = [
  { key: 'all', label: 'All 15' },
  { key: 'write', label: 'Write' },
  { key: 'sell', label: 'Sell' },
  { key: 'support', label: 'Support' },
  { key: 'grow', label: 'Grow' },
]

export default function ToolsPage() {
  const [filter, setFilter] = useState('all')
  const count = TOOLS.filter((t) => filter === 'all' || t.cat === filter).length

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="k-wrap k-page-head" style={{ paddingBottom: 34 }}>
          <div className="k-breadcrumb">
            <Link href="/">Home</Link> / Tools
          </div>
          <div className="eyebrow">The studio</div>
          <h1 className="k-h1" style={{ marginTop: 16 }}>
            Fifteen tools.
            <br />
            <span className="grad">One voice.</span>
          </h1>
          <p className="k-lead">
            Every tool reads from the same voice profile, so a listing, a
            caption, and a reply to a buyer all sound like the same person —
            you.
          </p>
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
            {TOOLS.map((t, i) => (
              <Reveal
                key={t.n}
                href="/dashboard"
                className="k-tool-card"
                delay={(i % 4) * 70}
                style={{
                  display: filter === 'all' || t.cat === filter ? undefined : 'none',
                }}
              >
                {t.popular && <span className="k-hot">POPULAR</span>}
                <div className="k-tool-top">
                  <div className="k-ico">{t.n}</div>
                  <span className={`k-cat ${t.cat}`}>{t.cat}</span>
                </div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <div className="k-go">Open in workspace</div>
              </Reveal>
            ))}
          </div>
          <p className="k-empty" style={{ display: count ? 'none' : 'block' }}>
            No tools in this category yet.
          </p>
        </section>

        <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
          <Reveal className="k-cta-band">
            <h2 className="k-h2">Every tool, in one quiet room.</h2>
            <p className="k-lead">
              Free for ten generations a month. No credit card, no onboarding
              call.
            </p>
            <div className="k-cta-row">
              <Link href="/dashboard" className="k-btn k-btn-primary">
                <span>Open the workspace</span>
                <i className="k-shine" />
              </Link>
              <Link href="/pricing" className="k-btn">
                Compare plans
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
