'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n/client'
import Reveal from '@/components/shared/reveal'

type Sample = {
  id: string
  tag: string
  href: string
  accent: string
  body: React.ReactNode
}

const SAMPLES: Sample[] = [
  {
    id: 'listing',
    tag: 'Listing',
    href: '/dashboard/listing',
    accent: '#2f5d3f',
    body: (
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[#9a948c]">Notes</p>
        <p className="rounded-lg bg-[#fbfaf8] p-3 text-sm leading-relaxed text-[#6b6560]">
          Hand-thrown ceramic mug, speckled stoneware, matte sage glaze, holds 12oz.
        </p>
        <div className="h-px bg-[#e9e5df]" />
        <p className="font-display text-lg leading-snug text-[#1a1714]">
          Speckled Stoneware Mug — Matte Sage, 12oz
        </p>
        <p className="text-sm leading-relaxed text-[#6b6560]">
          A hand-thrown mug with a soft matte sage glaze and a warm, earthy speckle.
          Dishwasher and microwave safe.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {['ceramic mug', 'stoneware', 'handmade', 'sage green'].map((t) => (
            <span key={t} className="rounded-full border border-[#e9e5df] bg-white px-3 py-1 text-xs text-[#3f3a35]">
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'photo',
    tag: 'Product photo',
    href: '/dashboard/images',
    accent: '#b4693a',
    body: (
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[#9a948c]">Generated shot</p>
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_30%_20%,#d9c7a8_0%,#8fa88c_55%,#4c6b52_100%)]">
          <div className="flex h-24 w-20 flex-col items-center rounded-b-2xl rounded-t-md bg-[#e8e0d2] shadow-[0_12px_24px_-10px_rgba(26,23,20,0.5)]">
            <div className="h-3 w-12 rounded-full bg-[#a58a6a] mt-3" />
            <div className="mt-1 h-1.5 w-12 rounded bg-[#a58a6a]" />
          </div>
        </div>
        <p className="text-sm text-[#6b6560]">
          One prompt, a clean product shot on a warm studio background.
        </p>
      </div>
    ),
  },
  {
    id: 'social',
    tag: 'Social post',
    href: '/dashboard/social',
    accent: '#3a6ea5',
    body: (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1714] text-xs font-semibold text-white">C</span>
          <div>
            <p className="text-sm font-medium text-[#1a1714]">craftly.mug</p>
            <p className="text-[10px] text-[#9a948c]">Sponsored</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-[#1a1714]">
          Mornings are better with a mug that fits your hand. ☕ Freshly glazed,
          limited batch of 20.
        </p>
        <div className="flex flex-wrap gap-2">
          {['#handmade', '#ceramics', '#smallbatch', '#etsyshop'].map((t) => (
            <span key={t} className="text-xs text-[#3a6ea5]">{t}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'seo',
    tag: 'SEO keywords',
    href: '/dashboard/keywords',
    accent: '#7a5aa5',
    body: (
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[#9a948c]">Buyers searched</p>
        <div className="flex flex-wrap gap-2">
          {['ceramic coffee mug', 'handmade mug gift', 'stoneware cup', 'sage green mug', 'pottery mug 12oz', 'minimalist mug', 'artisan coffee cup', 'microwave safe mug'].map(
            (t, i) => (
              <span
                key={t}
                className="rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: i < 3 ? 'rgba(47,93,63,0.12)' : '#f4f1ec',
                  color: i < 3 ? '#2f5d3f' : '#4a453f',
                }}
              >
                {t}
              </span>
            ),
          )}
        </div>
        <p className="text-sm text-[#6b6560]">High-intent terms, sized by search volume.</p>
      </div>
    ),
  },
  {
    id: 'reply',
    tag: 'Reply to buyer',
    href: '/dashboard/messages',
    accent: '#3a9b8a',
    body: (
      <div className="space-y-3">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[#e9e5df] p-3 text-sm text-[#3f3a35]">
          Hi! Does this mug come in a bigger size? I need one for lattes.
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#1a1714] p-3 text-sm text-white">
          Thanks for asking! Right now the 12oz is our only size, but a 16oz is in
          the kiln — I can reserve one for you. Want me to?
        </div>
        <p className="text-xs text-[#9a948c]">Warm, on-brand, in your own voice.</p>
      </div>
    ),
  },
  {
    id: 'ad',
    tag: 'Ad copy',
    href: '/dashboard/ad-copy',
    accent: '#b3403a',
    body: (
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[#9a948c]">Headline</p>
        <p className="font-display text-lg leading-snug text-[#1a1714]">
          The mug your coffee has been waiting for.
        </p>
        <div className="h-px bg-[#e9e5df]" />
        <p className="text-sm leading-relaxed text-[#6b6560]">
          Hand-thrown. Holds 12oz. Fits in your palm like it belongs there. Limited
          batch — when it&apos;s gone, it&apos;s gone.
        </p>
        <span className="inline-block rounded-full bg-[#1a1714] px-4 py-1.5 text-xs font-medium text-white">
          Shop now
        </span>
      </div>
    ),
  },
]

const FILTERS = ['All', 'Listing', 'Photo', 'Social', 'SEO', 'Reply', 'Ads']

export default function SampleGallery() {
  const { t } = useI18n()
  const [active, setActive] = useState('All')

  const shown = SAMPLES.filter((s) => {
    if (active === 'All') return true
    const map: Record<string, string> = {
      Listing: 'listing',
      Photo: 'photo',
      Social: 'social',
      SEO: 'seo',
      Reply: 'reply',
      Ads: 'ad',
    }
    return s.id === map[active]
  })

  return (
    <section className="border-t border-[#e9e5df] bg-[#f4f1ec] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#2f5d3f]">
            {t('home.galleryLabel')}
          </p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-4xl leading-[1.05] tracking-tight text-[#1a1714] md:text-5xl">
            {t('home.galleryTitle')}
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-5 max-w-xl text-center text-base text-[#6b6560] md:text-lg">
            {t('home.gallerySub')}
          </p>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active === f
                    ? 'bg-[#1a1714] text-white'
                    : 'border border-[#e9e5df] bg-white text-[#4a453f] hover:border-[#1a1714]/30'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((s, i) => (
            <Reveal key={s.id} delay={i * 50} className="h-full">
              <Link
                href={s.href}
                className="group flex h-full flex-col rounded-2xl border border-[#e9e5df] bg-white p-6 transition hover:-translate-y-1 hover:border-[#1a1714]/25 hover:shadow-[0_20px_44px_-26px_rgba(26,23,20,0.35)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: `${s.accent}14`, color: s.accent }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.accent }} />
                    {s.tag}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#c4beb5] transition group-hover:text-[#1a1714]" />
                </div>
                {s.body}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
