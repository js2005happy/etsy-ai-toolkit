'use client'

import Link from 'next/link'
import { ArrowRight, MapPin, MoveRight, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n/client'
import Reveal from '@/components/shared/reveal'

type Pairing = {
  from: string
  fromCountry: string
  to: string
  toCountry: string
  craft: string
  note: string
}

const PAIRINGS: Pairing[] = [
  {
    from: 'Kyoto',
    fromCountry: 'Japan',
    to: 'Seattle',
    toCountry: 'USA',
    craft: 'Hand-thrown stoneware',
    note: 'A Kyoto potter ships to a Seattle boutique, listings in both languages.',
  },
  {
    from: 'Jaipur',
    fromCountry: 'India',
    to: 'London',
    toCountry: 'UK',
    craft: 'Block-print textiles',
    note: 'A Jaipur workshop partners with a London homeware shop across time zones.',
  },
  {
    from: 'Oaxaca',
    fromCountry: 'Mexico',
    to: 'Melbourne',
    toCountry: 'Australia',
    craft: 'Woven baskets',
    note: 'A Oaxacan weaver finds buyers in Melbourne with translated listings.',
  },
]

export default function CrossBorder() {
  const { t } = useI18n()

  return (
    <section className="relative overflow-hidden bg-[#2f5d3f] px-6 py-24 md:py-32">
      {/* texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[#4c8a60]/40 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 h-[360px] w-[360px] rounded-full bg-[#1a1714]/30 blur-[110px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#cfe0d4]">
            {t('home.worldLabel')}
          </p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-4xl leading-[1.05] tracking-tight text-white md:text-5xl">
            {t('home.worldTitle')}
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-5 max-w-xl text-center text-base text-[#d7e2d9] md:text-lg">
            {t('home.worldSub')}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {PAIRINGS.map((p, i) => (
            <Reveal key={p.craft} delay={i * 70} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/[0.07] p-7 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/[0.11]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.from}
                    <span className="text-white/50">· {p.fromCountry}</span>
                  </span>
                  <MoveRight className="h-4 w-4 text-[#cfe0d4]" />
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.to}
                    <span className="text-white/50">· {p.toCountry}</span>
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl leading-tight text-white">
                  {p.craft}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#d7e2d9]">{p.note}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={140}>
          <div className="mt-14 flex justify-center">
            <Link
              href="/signup"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-medium text-[#2f5d3f] transition hover:bg-[#eef3ef]"
            >
              <Sparkles className="h-4 w-4" />
              {t('home.worldCta')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
