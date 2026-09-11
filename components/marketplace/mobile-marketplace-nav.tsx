'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  ['/discover', 'Discover'],
  ['/discover/sellers', 'Sellers'],
  ['/wishlist', 'Saved'],
  ['/compare', 'Compare'],
] as const

export default function MobileMarketplaceNav({ brand = 'Craftly Marketplace', brandHref = '/discover' }: { brand?: string; brandHref?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="w-full border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href={brandHref} className="min-w-0 truncate font-display text-lg font-bold md:text-xl">{brand}</Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {links.map(([href, label]) => <Link key={href} href={href} className="text-muted-foreground transition hover:text-foreground">{label}</Link>)}
          <Link href="/dashboard" className="rounded-lg border px-3 py-2 font-medium">Seller workspace</Link>
        </nav>
        <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle marketplace navigation" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t px-5 py-3 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">{label}</Link>)}
            <Link href="/dashboard" onClick={() => setOpen(false)} className="mt-1 rounded-lg bg-primary px-3 py-3 text-sm font-medium text-primary-foreground">Seller workspace</Link>
          </div>
        </nav>
      )}
    </div>
  )
}
