'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/shared/logo'
import LanguageSwitcher from '@/components/shared/language-switcher'
import { useI18n } from '@/lib/i18n/client'
import type { Locale } from '@/lib/i18n/locales'
import type { User } from '@supabase/supabase-js'

const LINKS = [
  { key: 'tools', href: '/tools' },
  { key: 'howItWorks', href: '/how-it-works' },
  { key: 'examples', href: '/examples' },
  { key: 'pricing', href: '/pricing' },
  { key: 'channels', href: '/dashboard/channels' },
  { key: 'openApp', href: '/dashboard' },
]

const channelLabel: Record<Locale, string> = {
  en: 'Sales Channels',
  de: 'Vertriebskanäle',
  fr: 'Canaux de vente',
  es: 'Canales de venta',
  zh: '销售渠道',
  ja: '販売チャネル',
  it: 'Canali di vendita',
  ko: '판매 채널',
  pt: 'Canais de venda',
}

export default function Navbar() {
  const pathname = usePathname()
  const { t, locale } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className={`k-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="k-wrap k-nav-in">
        <Logo />

        <div className={`k-nav-links${menuOpen ? ' open' : ''}`}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {l.key === 'channels' ? channelLabel[locale] : t(`nav.${l.key}`)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <Link href="/dashboard" className="k-btn k-btn-primary whitespace-nowrap">
              <span>{t('nav.dashboard')}</span>
              <i className="k-shine" />
            </Link>
          ) : (
            <Link href="/signup" className="k-btn k-btn-primary whitespace-nowrap">
              <span>{t('nav.startFree')}</span>
              <i className="k-shine" />
            </Link>
          )}
          <button
            type="button"
            className="k-nav-toggle"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <i />
          </button>
        </div>
      </div>
    </nav>
  )
}
