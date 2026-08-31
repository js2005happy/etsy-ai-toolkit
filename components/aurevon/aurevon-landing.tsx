'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Flower2, Globe, LayoutDashboard, UserRound, LogOut } from 'lucide-react'
import { useI18n } from '@/lib/i18n/client'
import { locales, type Locale } from '@/lib/i18n/locales'
import { createClient } from '@/lib/supabase/client'
import { PLATFORMS } from '@/lib/platforms'
import Reveal from '@/components/shared/reveal'
import type { User } from '@supabase/supabase-js'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260819_212700_3bb9329b-5c50-4257-a09b-ca85cf3654a3.mp4'

function LanguageSelect() {
  const { locale, setLocale } = useI18n()
  return (
    <div className="relative flex items-center">
      <Globe className="pointer-events-none absolute left-3 h-4 w-4 text-white/70" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label="Language"
        className="h-9 cursor-pointer appearance-none rounded-full border border-white/20 bg-transparent pl-9 pr-7 text-sm text-white/90 outline-none transition hover:bg-white/10"
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code} className="bg-black text-white">
            {l.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px] text-white/60">▾</span>
    </div>
  )
}

export default function AurevonLanding() {
  const { t } = useI18n()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [navMounted, setNavMounted] = useState(false)
  const [heroMounted, setHeroMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const links = [
    { label: t('nav.tools'), href: '#tools' },
    { label: t('nav.howItWorks'), href: '#how' },
    { label: t('nav.pricing'), href: '/pricing' },
    { label: t('nav.support'), href: '/contact' },
  ]

  const tools = [
    { n: '01', title: t('dashboard.toolListingTitle'), desc: t('dashboard.toolListingDesc'), href: '/dashboard/listing' },
    { n: '02', title: t('dashboard.toolMessagesTitle'), desc: t('dashboard.toolMessagesDesc'), href: '/dashboard/messages' },
    { n: '03', title: t('dashboard.toolSocialTitle'), desc: t('dashboard.toolSocialDesc'), href: '/dashboard/social' },
    { n: '04', title: t('dashboard.toolReviewsTitle'), desc: t('dashboard.toolReviewsDesc'), href: '/dashboard/reviews' },
    { n: '05', title: t('dashboard.toolAnnouncementTitle'), desc: t('dashboard.toolAnnouncementDesc'), href: '/dashboard/announcement' },
    { n: '06', title: t('dashboard.toolKeywordsTitle'), desc: t('dashboard.toolKeywordsDesc'), href: '/dashboard/keywords' },
    { n: '07', title: t('dashboard.toolTranslateTitle'), desc: t('dashboard.toolTranslateDesc'), href: '/dashboard/translate' },
    { n: '08', title: t('dashboard.toolOptimizerTitle'), desc: t('dashboard.toolOptimizerDesc'), href: '/dashboard/optimizer' },
    { n: '09', title: t('dashboard.toolPricingTitle'), desc: t('dashboard.toolPricingDesc'), href: '/dashboard/pricing' },
    { n: '10', title: t('dashboard.toolImagesTitle'), desc: t('dashboard.toolImagesDesc'), href: '/dashboard/images' },
    { n: '11', title: t('dashboard.toolBulletsTitle'), desc: t('dashboard.toolBulletsDesc'), href: '/dashboard/bullets' },
    { n: '12', title: t('dashboard.toolAdCopyTitle'), desc: t('dashboard.toolAdCopyDesc'), href: '/dashboard/ad-copy' },
    { n: '13', title: t('dashboard.toolEmailTitle'), desc: t('dashboard.toolEmailDesc'), href: '/dashboard/email' },
    { n: '14', title: t('dashboard.toolCompetitorTitle'), desc: t('dashboard.toolCompetitorDesc'), href: '/dashboard/competitor-analysis' },
    { n: '15', title: t('dashboard.toolBrandStoryTitle'), desc: t('dashboard.toolBrandStoryDesc'), href: '/dashboard/brand-story' },
  ]

  const steps = [
    { n: '01', title: t('home.step1Title'), desc: t('home.step1Desc') },
    { n: '02', title: t('home.step2Title'), desc: t('home.step2Desc') },
    { n: '03', title: t('home.step3Title'), desc: t('home.step3Desc') },
  ]

  const footerColumns = [
    {
      title: t('footer.product'),
      links: tools.map((tool) => ({ label: tool.title, href: tool.href })),
    },
    {
      title: t('footer.resources'),
      links: [
        { label: t('footer.howItWorks'), href: '#how' },
        { label: t('footer.pricing'), href: '/pricing' },
        { label: t('footer.dashboard'), href: '/dashboard' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: 'GitHub', href: 'https://github.com/js2005happy/etsy-ai-toolkit' },
        { label: t('footer.contact'), href: '/contact' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.terms'), href: '/terms' },
        { label: t('footer.privacy'), href: '/privacy' },
        { label: t('footer.refunds'), href: '/refund' },
      ],
    },
    {
      title: t('footer.account'),
      links: [
        { label: t('footer.logIn'), href: '/login' },
        { label: t('footer.signUp'), href: '/signup' },
      ],
    },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const navTimer = setTimeout(() => setNavMounted(true), 100)
    const heroTimer = setTimeout(() => setHeroMounted(true), 300)
    return () => {
      clearTimeout(navTimer)
      clearTimeout(heroTimer)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = overlayOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [overlayOpen])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const toggleOverlay = () => setOverlayOpen((v) => !v)
  const closeOverlay = () => setOverlayOpen(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? 'U'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <div className="relative min-h-screen bg-black">
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
          scrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:h-20 md:px-10">
          {/* Logo */}
          <a
            href="#"
            className={`z-50 text-xl font-semibold tracking-tight text-white transition-all duration-700 ease-entrance md:text-2xl ${
              navMounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '0ms' }}
          >
            {t('nav.brand')}
          </a>

          {/* Center pill (desktop) */}
          <button
            type="button"
            onClick={toggleOverlay}
            className={`hidden items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm text-white/90 transition-all duration-700 ease-entrance hover:bg-white/10 md:flex ${
              navMounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {overlayOpen ? 'Close' : 'Navigate'}
          </button>

          {/* Right: language + auth + flower (desktop) */}
          <div
            className={`hidden items-center gap-5 transition-all duration-700 ease-entrance md:flex ${
              navMounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <LanguageSelect />

            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label={t('nav.account')}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/20 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    initial
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/15 bg-black/90 p-1.5 shadow-xl backdrop-blur-md">
                    <div className="truncate px-3 py-2 text-xs text-white/60">{user.email}</div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white transition hover:bg-white/10"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white transition hover:bg-white/10"
                    >
                      <UserRound className="h-4 w-4" />
                      {t('nav.account')}
                    </Link>
                    <div className="my-1 h-px bg-white/10" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white transition hover:bg-white/10"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/login" className="text-sm text-white/80 transition hover:text-white">
                  {t('nav.logIn')}
                </a>
                <a
                  href="/signup"
                  className="rounded-full border border-white/20 px-5 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  {t('nav.signUp')}
                </a>
              </>
            )}

            <Flower2 className="h-7 w-7 text-white/90" />
          </div>

          {/* Right: hamburger (mobile) */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={toggleOverlay}
            className={`flex h-8 w-8 flex-col items-center justify-center gap-1.5 transition-all duration-700 ease-entrance md:hidden ${
              navMounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <span
              className={`h-[2px] w-6 bg-white transition-all duration-500 ease-overlay ${
                overlayOpen ? 'translate-y-[4px] rotate-45' : ''
              }`}
            />
            <span
              className={`h-[2px] w-6 bg-white transition-all duration-500 ease-overlay ${
                overlayOpen ? '-translate-y-[4px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* Overlay menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-black transition-all duration-700 ease-overlay ${
          overlayOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-8">
          {links.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeOverlay}
              className={`font-instrument text-4xl text-white transition-all duration-[600ms] ease-overlay hover:opacity-60 md:text-6xl ${
                overlayOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: overlayOpen ? `${150 + i * 80}ms` : '0ms' }}
            >
              {link.label}
            </a>
          ))}

          <div
            className={`mt-4 flex flex-col items-center gap-6 transition-all duration-[600ms] ease-overlay ${
              overlayOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: overlayOpen ? `${150 + links.length * 80}ms` : '0ms' }}
          >
            <LanguageSelect />

            {user ? (
              <Link
                href="/dashboard"
                onClick={closeOverlay}
                className="rounded-full border border-white/30 px-6 py-2 text-lg text-white transition hover:bg-white/10 md:text-xl"
              >
                {t('nav.dashboard')}
              </Link>
            ) : (
              <div className="flex items-center gap-8">
                <a
                  href="/login"
                  onClick={closeOverlay}
                  className="text-lg text-white/70 transition hover:text-white md:text-xl"
                >
                  {t('nav.logIn')}
                </a>
                <a
                  href="/signup"
                  onClick={closeOverlay}
                  className="rounded-full border border-white/30 px-6 py-2 text-lg text-white transition hover:bg-white/10 md:text-xl"
                >
                  {t('nav.signUp')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative flex h-screen w-full items-end justify-center overflow-hidden">
        {/* Background video */}
        <div
          className={`absolute inset-0 transition-all duration-[1400ms] ease-entrance ${
            heroMounted ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
          }`}
        >
          <video
            src={VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />
        </div>

        {/* Foreground */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-16 text-center md:pb-24">
          <h1
            className={`font-instrument mb-5 text-[2.5rem] leading-[0.95] text-white transition-all duration-[900ms] ease-entrance sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl ${
              heroMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            {t('home.heroTitleA')}
            <br className="hidden sm:block" />
            <span className="italic text-[#e0b379]">{t('home.heroTitleB')}</span>
          </h1>

          <p
            className={`mx-auto mb-8 max-w-md text-base text-white/70 transition-all duration-[900ms] ease-entrance md:mb-10 md:text-lg ${
              heroMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            {t('home.heroSub')}
          </p>

          <div
            className={`flex flex-col items-center justify-center gap-4 transition-all duration-[900ms] ease-entrance sm:flex-row sm:gap-8 ${
              heroMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            <Link
              href="/signup"
              className="inline-block rounded-full bg-[#e0b379] px-8 py-3.5 text-sm font-medium text-black transition hover:bg-[#e0b379]/90 md:text-base"
            >
              {t('home.startFree')}
            </Link>
            <a
              href="#tools"
              className="text-sm text-white/80 transition hover:text-white md:text-base"
            >
              {t('home.learnMore')}
            </a>
          </div>
        </div>
      </section>

      {/* Platform strip */}
      <section className="border-t border-white/10 px-6 py-12 md:py-16">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="text-center text-xs font-medium uppercase tracking-[0.22em] text-white/40">
              {t('home.platformsLabel')}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:gap-x-14">
              {PLATFORMS.map((p) => (
                <span
                  key={p.id}
                  className="font-instrument text-xl text-white/45 transition-colors hover:text-white/80 md:text-2xl"
                >
                  {p.label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tools showcase */}
      <section id="tools" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#e0b379]">
              {t('home.listingGenerator')}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-instrument mx-auto mt-5 max-w-3xl text-center text-[2.5rem] leading-[1.02] text-white md:text-6xl">
              {t('home.writeListingTitle')}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base text-white/60 md:text-lg">
              {t('home.writeListingSub')}
            </p>
          </Reveal>
          <Reveal delay={240} className="mt-14 md:mt-20">
            <div className="mx-auto max-w-[820px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#e0b379]/60" />
              </div>
              <div className="mt-8 space-y-5">
                <div className="h-3 w-2/3 rounded-full bg-white/15" />
                <div className="h-3 w-1/2 rounded-full bg-white/10" />
                <div className="space-y-2 pt-4">
                  <div className="h-2 w-full rounded-full bg-white/5" />
                  <div className="h-2 w-full rounded-full bg-white/5" />
                  <div className="h-2 w-2/3 rounded-full bg-white/5" />
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="rounded-full border border-[#e0b379]/30 px-4 py-1.5 text-xs text-[#e0b379]"
                    >
                      #{i + 1}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-white/10 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#e0b379]">
              {t('home.nineTools')}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-instrument mx-auto mt-5 max-w-3xl text-center text-[2.5rem] leading-[1.02] text-white md:text-6xl">
              {t('home.everythingTitle')}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base text-white/60 md:text-lg">
              {t('home.everythingSub')}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {tools.map((tool, i) => (
              <Reveal key={tool.href} delay={(i % 2) * 80} className="h-full">
                <Link
                  href={tool.href}
                  className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-colors hover:border-[#e0b379]/40 hover:bg-white/[0.05] md:p-10"
                >
                  <span className="font-instrument text-sm text-[#e0b379]">{tool.n}</span>
                  <h3 className="font-instrument mt-4 text-2xl text-white md:text-3xl">
                    {tool.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-white/60">{tool.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-white/10 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#e0b379]">
              {t('home.howItWorks')}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-instrument mx-auto mt-5 max-w-3xl text-center text-[2.5rem] leading-[1.02] text-white md:text-6xl">
              {t('home.threeStepsTitle')}
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 80} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                  <span className="font-instrument text-sm text-[#e0b379]">{s.n}</span>
                  <h3 className="font-instrument mt-4 text-2xl text-white">{s.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-white/60">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/10 px-6 py-28 text-center md:py-40">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-instrument text-[2.5rem] leading-[1.02] text-white md:text-6xl">
              {t('home.finalTitle')}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-6 max-w-md text-base text-white/60 md:text-lg">
              {t('home.finalSub')}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <Link
              href="/signup"
              className="mt-10 inline-block rounded-full bg-[#e0b379] px-8 py-3.5 text-sm font-medium text-black transition hover:bg-[#e0b379]/90 md:text-base"
            >
              {t('home.startFree')}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 pb-12 pt-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 flex items-center gap-2.5">
            <Flower2 className="h-5 w-5 text-[#e0b379]" />
            <span className="font-instrument text-xl text-white">{t('nav.brand')}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => {
                    const external = link.href.startsWith('http')
                    return (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noopener noreferrer' : undefined}
                          className="text-sm text-white/50 transition-colors hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6">
            <a
              href="https://dang.ai"
              target="_blank"
              rel="dofollow noopener"
              aria-label="Verified on DANG!"
              className="inline-block transition-opacity hover:opacity-80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://assets.dang.ai/badges/dang-verified-dark.png"
                alt="Verified on DANG!"
                width={180}
                height={65}
                className="h-auto w-[180px] max-w-full"
              />
            </a>
            <a
              href="https://www.toolpilot.ai"
              target="_blank"
              rel="dofollow noopener"
              aria-label="ToolPilot AI"
              className="inline-block transition-opacity hover:opacity-80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.toolpilot.ai/cdn/shop/files/f-w_690x151_crop_center.png"
                alt="ToolPilot AI"
                width={180}
                height={39}
                className="h-auto w-[180px] max-w-full"
              />
            </a>
            <a
              href="https://www.producthunt.com/products/etsy-ai-toolkit?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-etsy-ai-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Etsy AI Toolkit on Product Hunt"
              className="inline-block transition-opacity hover:opacity-80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1236192&theme=light"
                alt="Etsy AI Toolkit - Made by you. Written by AI. | Product Hunt"
                width={250}
                height={54}
                className="h-[54px] w-auto"
              />
            </a>
          </div>

          <p className="mt-6 text-sm text-white/40">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
