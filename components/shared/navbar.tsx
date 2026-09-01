'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/shared/logo'
import type { User } from '@supabase/supabase-js'

const LINKS = [
  { label: 'Tools', href: '/tools' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Examples', href: '/examples' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Open app', href: '/dashboard' },
]

export default function Navbar() {
  const pathname = usePathname()
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
    if (href === '/dashboard') return pathname.startsWith('/dashboard')
    return pathname === href
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
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="k-btn k-btn-primary">
              <span>Dashboard</span>
              <i className="k-shine" />
            </Link>
          ) : (
            <Link href="/signup" className="k-btn k-btn-primary">
              <span>Start free</span>
              <i className="k-shine" />
            </Link>
          )}
          <button
            type="button"
            className="k-nav-toggle"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <i />
          </button>
        </div>
      </div>
    </nav>
  )
}
