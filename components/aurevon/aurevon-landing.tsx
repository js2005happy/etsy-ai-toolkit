'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Globe,
  LayoutDashboard,
  UserRound,
  LogOut,
  FileText,
  Search,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  Menu,
  X,
  Mail,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/client'
import { locales, type Locale } from '@/lib/i18n/locales'
import { createClient } from '@/lib/supabase/client'
import { PLATFORMS } from '@/lib/platforms'
import Reveal from '@/components/shared/reveal'
import SampleGallery from '@/components/aurevon/sample-gallery'
import CrossBorder from '@/components/aurevon/cross-border'
import type { User } from '@supabase/supabase-js'

const INK = '#1a1714'
const MUTED = '#6b6560'
const LINE = '#e9e5df'
const PAPER = '#fbfaf8'
const ACCENT = '#2f5d3f'

function LanguageSelect() {
  const { locale, setLocale } = useI18n()
  return (
    <div className="relative flex items-center">
      <Globe className="pointer-events-none absolute left-3 h-4 w-4 text-[#6b6560]" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label="Language"
        className="h-9 cursor-pointer appearance-none rounded-full border border-[#e9e5df] bg-transparent pl-9 pr-7 text-sm text-[#3f3a35] outline-none transition hover:bg-[#f4f1ec]"
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px] text-[#9a948c]">▾</span>
    </div>
  )
}

function ProductMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e9e5df] bg-white shadow-[0_24px_60px_-30px_rgba(26,23,20,0.25)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-[#e9e5df] px-5 py-3.5">
        <span className="h-3 w-3 rounded-full bg-[#e2e0dc]" />
        <span className="h-3 w-3 rounded-full bg-[#e2e0dc]" />
        <span className="h-3 w-3 rounded-full bg-[#e2e0dc]" />
        <div className="ml-3 flex-1 rounded-md bg-[#f4f1ec] px-3 py-1.5 text-xs text-[#8a857e]">
          craftly.world/listing
        </div>
      </div>
      <div className="grid divide-y divide-[#e9e5df] md:grid-cols-2 md:divide-x md:divide-y-0">
        {/* input */}
        <div className="p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a948c]">Your notes</p>
          <div className="mt-4 rounded-xl border border-[#e9e5df] bg-[#fbfaf8] p-5 text-sm leading-relaxed text-[#4a453f]">
            Hand-thrown ceramic mug in speckled stoneware. Holds 12oz, glazed in matte
            sage, microwave and dishwasher safe.
          </div>
          <div className="mt-4 flex h-10 items-center justify-center rounded-xl bg-[#1a1714] text-sm font-medium text-white">
            Write the listing
          </div>
        </div>
        {/* output */}
        <div className="bg-[#fbfaf8] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a948c]">
            Ready to publish
          </p>
          <p className="mt-4 font-display text-xl leading-snug text-[#1a1714] md:text-2xl">
            Speckled Stoneware Mug — Matte Sage, 12oz
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#4a453f]">
            A hand-thrown mug with a soft matte sage glaze and a warm, earthy speckle.
            Holds 12 ounces, dishwasher and microwave safe.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['ceramic mug', 'stoneware', 'handmade', 'sage green'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#e9e5df] bg-white px-3 py-1 text-xs text-[#3f3a35]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AurevonLanding() {
  const { t } = useI18n()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const links = [
    { label: t('nav.tools'), href: '#tools' },
    { label: t('nav.howItWorks'), href: '#how' },
    { label: t('nav.pricing'), href: '/pricing' },
    { label: t('nav.support'), href: '/contact' },
  ]

  const goals = [
    {
      icon: FileText,
      title: t('home.goalCreateTitle'),
      desc: t('home.goalCreateDesc'),
      href: '/dashboard/listing',
    },
    {
      icon: Search,
      title: t('home.goalOptimizeTitle'),
      desc: t('home.goalOptimizeDesc'),
      href: '/dashboard/optimizer',
    },
    {
      icon: MessageCircle,
      title: t('home.goalReplyTitle'),
      desc: t('home.goalReplyDesc'),
      href: '/dashboard/messages',
    },
    {
      icon: TrendingUp,
      title: t('home.goalGrowTitle'),
      desc: t('home.goalGrowDesc'),
      href: '/dashboard/pricing',
    },
  ]

  const groups = [
    {
      label: t('home.groupCreate'),
      benefit: t('home.groupCreateBenefit'),
      tools: [
        { title: t('dashboard.toolListingTitle'), desc: t('dashboard.toolListingDesc'), href: '/dashboard/listing' },
        { title: t('dashboard.toolBulletsTitle'), desc: t('dashboard.toolBulletsDesc'), href: '/dashboard/bullets' },
        { title: t('dashboard.toolBrandStoryTitle'), desc: t('dashboard.toolBrandStoryDesc'), href: '/dashboard/brand-story' },
        { title: t('dashboard.toolImagesTitle'), desc: t('dashboard.toolImagesDesc'), href: '/dashboard/images' },
      ],
    },
    {
      label: t('home.groupOptimize'),
      benefit: t('home.groupOptimizeBenefit'),
      tools: [
        { title: t('dashboard.toolOptimizerTitle'), desc: t('dashboard.toolOptimizerDesc'), href: '/dashboard/optimizer' },
        { title: t('dashboard.toolKeywordsTitle'), desc: t('dashboard.toolKeywordsDesc'), href: '/dashboard/keywords' },
        { title: t('dashboard.toolTranslateTitle'), desc: t('dashboard.toolTranslateDesc'), href: '/dashboard/translate' },
        { title: t('dashboard.toolCompetitorTitle'), desc: t('dashboard.toolCompetitorDesc'), href: '/dashboard/competitor-analysis' },
      ],
    },
    {
      label: t('home.groupReply'),
      benefit: t('home.groupReplyBenefit'),
      tools: [
        { title: t('dashboard.toolMessagesTitle'), desc: t('dashboard.toolMessagesDesc'), href: '/dashboard/messages' },
        { title: t('dashboard.toolReviewsTitle'), desc: t('dashboard.toolReviewsDesc'), href: '/dashboard/reviews' },
        { title: t('dashboard.toolEmailTitle'), desc: t('dashboard.toolEmailDesc'), href: '/dashboard/email' },
        { title: t('dashboard.toolAnnouncementTitle'), desc: t('dashboard.toolAnnouncementDesc'), href: '/dashboard/announcement' },
      ],
    },
    {
      label: t('home.groupGrow'),
      benefit: t('home.groupGrowBenefit'),
      tools: [
        { title: t('dashboard.toolSocialTitle'), desc: t('dashboard.toolSocialDesc'), href: '/dashboard/social' },
        { title: t('dashboard.toolAdCopyTitle'), desc: t('dashboard.toolAdCopyDesc'), href: '/dashboard/ad-copy' },
        { title: t('dashboard.toolPricingTitle'), desc: t('dashboard.toolPricingDesc'), href: '/dashboard/pricing' },
      ],
    },
  ]

  const steps = [
    { n: '01', title: t('home.step1Title'), desc: t('home.step1Desc') },
    { n: '02', title: t('home.step2Title'), desc: t('home.step2Desc') },
    { n: '03', title: t('home.step3Title'), desc: t('home.step3Desc') },
  ]

  const proof = [
    { title: t('home.proof1Title'), desc: t('home.proof1Desc') },
    { title: t('home.proof2Title'), desc: t('home.proof2Desc') },
    { title: t('home.proof3Title'), desc: t('home.proof3Desc') },
  ]

  const footerColumns = [
    {
      title: t('footer.product'),
      links: groups.flatMap((g) => g.tools.map((tool) => ({ label: tool.title, href: tool.href }))),
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
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

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
    <div className="relative min-h-screen bg-[#fbfaf8] text-[#1a1714]" style={{ fontFeatureSettings: '"ss01" on' }}>
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          scrolled ? 'border-b border-[#e9e5df] bg-[#fbfaf8]/90 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#" className="text-lg font-semibold tracking-tight text-[#1a1714]">
            {t('nav.brand')}
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[#4a453f] transition-colors hover:text-[#1a1714]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <LanguageSelect />
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label={t('nav.account')}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#e9e5df] text-sm font-semibold text-[#1a1714] transition hover:bg-[#f4f1ec]"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    initial
                  )}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-[#e9e5df] bg-white p-1.5 shadow-lg">
                    <div className="truncate px-3 py-2 text-xs text-[#8a857e]">{user.email}</div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#1a1714] transition hover:bg-[#f4f1ec]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#1a1714] transition hover:bg-[#f4f1ec]"
                    >
                      <UserRound className="h-4 w-4" />
                      {t('nav.account')}
                    </Link>
                    <div className="my-1 h-px bg-[#e9e5df]" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#1a1714] transition hover:bg-[#f4f1ec]"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/login" className="text-sm text-[#4a453f] transition-colors hover:text-[#1a1714]">
                  {t('nav.logIn')}
                </a>
                <a
                  href="/signup"
                  className="rounded-full bg-[#1a1714] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#33302c]"
                >
                  {t('pricing.startFree')}
                </a>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e9e5df] text-[#1a1714] md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#fbfaf8] pt-16 md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-lg text-[#1a1714] transition hover:bg-[#f4f1ec]"
              >
                {link.label}
              </a>
            ))}
            <div className="my-3 h-px bg-[#e9e5df]" />
            <div className="flex items-center justify-between px-3">
              <LanguageSelect />
              {user ? (
                <a
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-[#1a1714] px-5 py-2 text-sm font-medium text-white"
                >
                  {t('nav.dashboard')}
                </a>
              ) : (
                <a
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-[#1a1714] px-5 py-2 text-sm font-medium text-white"
                >
                  {t('pricing.startFree')}
                </a>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Hero */}
      <section className="px-6 pb-20 pt-32 md:pb-28 md:pt-44">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="text-sm font-medium text-[#2f5d3f]">{t('home.platformsLabel')}</p>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight text-[#1a1714] sm:text-6xl md:text-7xl">
                {t('home.heroTitleA')}
                <br className="hidden sm:block" />
                {t('home.heroTitleB')}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#6b6560]">
                {t('home.heroSub')}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#1a1714] px-8 text-sm font-medium text-white transition hover:bg-[#33302c]"
                >
                  {t('pricing.startFree')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex h-12 items-center justify-center px-4 text-sm font-medium text-[#4a453f] transition hover:text-[#1a1714]"
                >
                  {t('nav.howItWorks')}
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={240} className="mt-16 md:mt-20">
            <div className="mx-auto max-w-4xl">
              <ProductMockup />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Platform strip */}
      <section className="border-y border-[#e9e5df] bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-14">
            {PLATFORMS.map((p) => (
              <span key={p.id} className="text-lg font-medium text-[#b6b0a8] md:text-xl">
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Goal picker */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#2f5d3f]">
              {t('home.goalLabel')}
            </p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-4xl leading-[1.05] tracking-tight text-[#1a1714] md:text-5xl">
              {t('home.goalTitle')}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-5 max-w-xl text-center text-base text-[#6b6560] md:text-lg">
              {t('home.goalSub')}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {goals.map((goal, i) => (
              <Reveal key={goal.href} delay={i * 60} className="h-full">
                <Link
                  href={goal.href}
                  className="group flex h-full flex-col rounded-2xl border border-[#e9e5df] bg-white p-7 transition hover:border-[#1a1714]/30 hover:shadow-[0_16px_40px_-24px_rgba(26,23,20,0.25)]"
                >
                  <goal.icon className="h-6 w-6 text-[#2f5d3f]" />
                  <h3 className="mt-5 font-display text-xl text-[#1a1714]">{goal.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6b6560]">{goal.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#1a1714]">
                    {t('nav.dashboard')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tools grouped by goal */}
      <section id="tools" className="border-t border-[#e9e5df] bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f5d3f]">
              {t('home.nineTools')}
            </p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] tracking-tight text-[#1a1714] md:text-5xl">
              {t('home.everythingTitle')}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-5 max-w-xl text-base text-[#6b6560] md:text-lg">
              {t('home.everythingSub')}
            </p>
          </Reveal>

          <div className="mt-16 grid gap-12 md:grid-cols-2">
            {groups.map((group, gi) => (
              <Reveal key={group.label} delay={gi * 60}>
                <div className="flex items-baseline justify-between border-b border-[#e9e5df] pb-4">
                  <h3 className="font-display text-2xl text-[#1a1714]">{group.label}</h3>
                </div>
                <p className="mt-3 text-sm text-[#6b6560]">{group.benefit}</p>
                <ul className="mt-5 divide-y divide-[#f4f1ec]">
                  {group.tools.map((tool) => (
                    <li key={tool.href}>
                      <Link
                        href={tool.href}
                        className="group flex items-center justify-between gap-4 py-4"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-[#1a1714] transition group-hover:text-[#2f5d3f]">
                            {tool.title}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-[#8a857e]">{tool.desc}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#c4beb5] transition group-hover:translate-x-0.5 group-hover:text-[#1a1714]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SampleGallery />

      {/* How it works */}
      <section id="how" className="border-t border-[#e9e5df] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#2f5d3f]">
              {t('home.howItWorks')}
            </p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-4xl leading-[1.05] tracking-tight text-[#1a1714] md:text-5xl">
              {t('home.threeStepsTitle')}
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 60} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-[#e9e5df] bg-white p-8">
                  <span className="font-display text-sm text-[#2f5d3f]">{s.n}</span>
                  <h3 className="mt-4 font-display text-2xl text-[#1a1714]">{s.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-[#6b6560]">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Proof / trust */}
      <section className="border-t border-[#e9e5df] bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#2f5d3f]">
              {t('home.proofLabel')}
            </p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-4xl leading-[1.05] tracking-tight text-[#1a1714] md:text-5xl">
              {t('home.proofTitle')}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-5 max-w-xl text-center text-base text-[#6b6560] md:text-lg">
              {t('home.proofSub')}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {proof.map((item, i) => (
              <Reveal key={item.title} delay={i * 60} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-[#e9e5df] bg-[#fbfaf8] p-8">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f5d3f]/10 text-sm font-semibold text-[#2f5d3f]">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 font-display text-xl text-[#1a1714]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#6b6560]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CrossBorder />

      {/* Final CTA */}
      <section className="border-t border-[#e9e5df] px-6 py-28 text-center md:py-36">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-[#1a1714] md:text-6xl">
              {t('home.finalTitle')}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-6 max-w-md text-base text-[#6b6560] md:text-lg">
              {t('home.finalSub')}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <Link
              href="/signup"
              className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-[#1a1714] px-8 text-sm font-medium text-white transition hover:bg-[#33302c]"
            >
              {t('pricing.startFree')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e9e5df] bg-white px-6 pb-12 pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <span className="text-xl font-semibold tracking-tight text-[#1a1714]">{t('nav.brand')}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-[#1a1714]">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => {
                    const external = link.href.startsWith('http')
                    return (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noopener noreferrer' : undefined}
                          className="text-sm text-[#6b6560] transition-colors hover:text-[#1a1714]"
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

          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[#e9e5df] pt-6">
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

          <div className="mt-8 flex flex-col gap-3 border-t border-[#e9e5df] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <a
              href="mailto:contact@craftly.world"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1a1714] transition-colors hover:text-[#2f5d3f]"
            >
              <Mail className="h-4 w-4" />
              contact@craftly.world
            </a>
            <p className="text-sm text-[#9a948c]">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
