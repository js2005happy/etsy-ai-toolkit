'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  ['/discover', 'Discover'],
  ['/discover/sellers', 'Sellers'],
  ['/wishlist', 'Saved'],
  ['/recently-viewed', 'Recent'],
  ['/compare', 'Compare'],
] as const

export default function MobileMarketplaceNav({ brand = 'Craftly Marketplace', brandHref = '/discover' }: { brand?: string; brandHref?: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isCurrent = (href: string) => href === '/discover' ? pathname === href : pathname.startsWith(href)

  return (
    <header className="w-full border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href={brandHref} className="min-w-0 truncate rounded font-display text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-xl">{brand}</Link>
        <nav aria-label="Marketplace" className="hidden items-center gap-5 text-sm md:flex">
          {links.map(([href, label]) => <Link key={href} href={href} aria-current={isCurrent(href) ? 'page' : undefined} className={`rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isCurrent(href) ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{label}</Link>)}
          <Link href="/dashboard" className="rounded-lg border px-3 py-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Seller workspace</Link>
        </nav>
        <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close marketplace navigation' : 'Open marketplace navigation'} aria-expanded={open} aria-controls="marketplace-mobile-nav">
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <nav id="marketplace-mobile-nav" aria-label="Marketplace mobile" className="border-t px-5 py-3 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map(([href, label]) => <Link key={href} href={href} aria-current={isCurrent(href) ? 'page' : undefined} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isCurrent(href) ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{label}</Link>)}
            <Link href="/dashboard" onClick={() => setOpen(false)} className="mt-1 rounded-lg bg-primary px-3 py-3 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Seller workspace</Link>
          </div>
        </nav>
      )}
    </header>
  )
}
