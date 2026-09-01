'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar'
import SiteFooter from '@/components/shared/site-footer'
import Reveal from '@/components/shared/reveal'
import CountUp from '@/components/shared/count-up'

type Example = {
  title: string
  cat: 'listings' | 'posts' | 'replies' | 'emails'
  catLabel: string
  beforeLabel: string
  before: string
  after: string
  match: number
  seconds: number
}

const EXAMPLES: Example[] = [
  {
    title: 'Speckled mug, sage',
    cat: 'listings',
    catLabel: 'Listing',
    beforeLabel: "Maker's note",
    before: 'speckled mug sage glaze 12oz dishwasher ok — small batch, made last week',
    after:
      'Hand-thrown Speckled Mug — Sage. Thrown on the wheel in small batches, then glazed in a soft sage that pools a shade deeper near the foot. Iron in the clay burns through as fine speckles, so no two are quite alike.\n\nHolds 12oz. Dishwasher and microwave safe. Made last week, in a batch of eleven.',
    match: 96,
    seconds: 41,
  },
  {
    title: 'Linen apron, oat',
    cat: 'listings',
    catLabel: 'Listing',
    beforeLabel: "Maker's note",
    before: 'oat linen apron one size pocket big enough for phone machine wash cold i think?',
    after:
      "A linen apron that gets better after the first wash.\n\nCut from 8oz European linen in oat, with a wide neck strap that doesn't twist and one pocket deep enough for a phone. One size, with an adjustable waist tie.\n\nMachine wash cold, hang to dry. The wrinkles are part of it.",
    match: 95,
    seconds: 38,
  },
  {
    title: 'Brass bookmark',
    cat: 'listings',
    catLabel: 'Listing',
    beforeLabel: "Maker's note",
    before: 'brass bookmark 4 inches cut by hand edges rounded will go dark over time',
    after:
      "Solid brass, 4 inches long — heavy enough to stay put, thin enough not to crease the spine.\n\nCut and tumbled by hand, so the edges are rounded rather than sharp. Brass darkens where you hold it. That's the material, not a defect, and a soft cloth brings it back.",
    match: 97,
    seconds: 33,
  },
  {
    title: 'Kiln day',
    cat: 'posts',
    catLabel: 'Instagram',
    beforeLabel: "Maker's note",
    before: 'kiln opening 12 mugs went in 11 survived one cracked handle',
    after:
      "Twelve went in. Eleven came out.\n\nThe twelfth cracked at the handle sometime in the last two hours of cooling, which is the part you can't watch. I kept it. It's on the shelf by the sink, holding pencils.\n\nEleven mugs, sage and oat, in the shop Thursday.",
    match: 94,
    seconds: 22,
  },
  {
    title: 'Shelf restock',
    cat: 'posts',
    catLabel: 'Instagram',
    beforeLabel: "Maker's note",
    before: 'shelf full again after 3 weeks sorry for the wait',
    after:
      "The shelf is full again, three weeks later than I said it would be.\n\nClay arrived late, then the kiln decided to take a week off. Both are fixed. Everything on these two shelves is dry, glazed, and going live at 11am.\n\nThanks for waiting. I know three weeks is a long time in mug terms.",
    match: 96,
    seconds: 24,
  },
  {
    title: 'Studio shelf pin',
    cat: 'posts',
    catLabel: 'Pinterest',
    beforeLabel: "Maker's note",
    before: 'photo of shelf with ceramics morning light',
    after:
      'Title: Handmade Ceramic Mugs, Sage Green — Small Batch Pottery\n\nDescription: A shelf of wheel-thrown mugs in sage and oat, drying before the first firing. Handmade stoneware, small batches, glazed and fired in a home studio. Save this for kitchen shelf ideas and handmade pottery inspiration.',
    match: 92,
    seconds: 27,
  },
  {
    title: 'Canada shipping',
    cat: 'replies',
    catLabel: 'Buyer reply',
    beforeLabel: "Buyer's message",
    before: 'hi do you ship to canada and how much',
    after:
      "We do — tracked shipping to Canada is $14, and it usually lands in 6–9 business days once it leaves the studio.\n\nIf you'd like one held, say the word and I'll set it aside for 48 hours.",
    match: 97,
    seconds: 14,
  },
  {
    title: 'A three-star review',
    cat: 'replies',
    catLabel: 'Review response',
    beforeLabel: 'Review',
    before: '★★★☆☆ — nice mug but smaller than I expected',
    after:
      "Fair point, and I should have been clearer — it's 12oz, which is a smaller pour than most diner mugs. I've added the height in inches to the listing photos so it's easier to judge before ordering.\n\nThanks for taking the time to say so.",
    match: 95,
    seconds: 16,
  },
  {
    title: 'Batch 14 dispatch',
    cat: 'emails',
    catLabel: 'Shipping note',
    beforeLabel: "Maker's note",
    before: '2 mugs to portland tracked should be there thursday packed in paper',
    after:
      "Your two mugs left the studio this morning and are tracking for Thursday. They're boxed in shredded paper, no plastic.\n\nFirst wash by hand if you can, though the dishwasher won't hurt them. If anything arrived unhappy, tell me and I'll replace it.",
    match: 98,
    seconds: 15,
  },
  {
    title: 'Newsletter blurb',
    cat: 'emails',
    catLabel: 'Newsletter',
    beforeLabel: "Maker's note",
    before: 'batch 14 ships friday 11 mugs one cracked next batch in a few weeks',
    after:
      "Batch fourteen is glazed, fired, and going out Friday. Twelve went into the kiln and eleven came back out — the twelfth cracked at the handle and it's holding pencils on my shelf now, which is where the good failures end up. Sage and oat, twelve ounces, $38. There won't be a batch fifteen until the clay order lands, so if you've been waiting on one, Friday morning is the time.",
    match: 96,
    seconds: 29,
  },
]

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'listings', label: 'Listings' },
  { key: 'posts', label: 'Posts' },
  { key: 'replies', label: 'Replies' },
  { key: 'emails', label: 'Emails' },
]

export default function ExamplesPage() {
  const [filter, setFilter] = useState('all')
  const [copied, setCopied] = useState<number | null>(null)

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
            <Link href="/">Home</Link> / Examples
          </div>
          <div className="eyebrow">Before &amp; after</div>
          <h1 className="k-h1" style={{ marginTop: 16 }}>
            The note on the left.
            <br />
            <span className="grad">The words on</span>{' '}
            <em className="serif-accent">the right.</em>
          </h1>
          <p className="k-lead">
            Every pair below started as something a maker actually typed in a
            hurry. Nothing on the right was hand-edited after generation —
            these are raw outputs.
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
                  <div className="k-lbl">Craftly</div>
                  <p>{e.after}</p>
                </div>
                <div className="k-ex-foot">
                  <span className="k-match">
                    Voice match <b>{e.match}%</b> · {e.seconds} seconds
                  </span>
                  <button
                    type="button"
                    className="k-btn k-btn-sm"
                    onClick={() => copy(e.after, i)}
                  >
                    {copied === i ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="k-empty" style={{ display: count ? 'none' : 'block' }}>
            No examples in this category yet.
          </p>
          <p className="k-note">
            Match percentages come from the maker&apos;s own voice profile,
            measured against their past writing. Times are generation time, not
            editing time.
          </p>
        </section>

        <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
          <div className="k-stats">
            <Reveal className="k-stat">
              <CountUp target={96} suffix="%" />
              <span>average voice match</span>
            </Reveal>
            <Reveal className="k-stat">
              <CountUp target={38} suffix="s" />
              <span>median generation time</span>
            </Reveal>
            <Reveal className="k-stat">
              <CountUp target={4200} suffix="+" />
              <span>makers writing daily</span>
            </Reveal>
            <Reveal className="k-stat">
              <CountUp target={15} suffix="" />
              <span>tools, one profile</span>
            </Reveal>
          </div>
        </section>

        <section className="k-wrap k-section" style={{ paddingTop: 0 }}>
          <Reveal className="k-cta-band">
            <h2 className="k-h2">Your notes in, your words out.</h2>
            <p className="k-lead">
              Paste the messiest description you&apos;ve got and see what comes
              back. Ten tries a month are free.
            </p>
            <div className="k-cta-row">
              <Link href="/signup" className="k-btn k-btn-primary">
                <span>Try it on my own notes</span>
                <i className="k-shine" />
              </Link>
              <Link href="/tools" className="k-btn">
                Browse the tools
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
