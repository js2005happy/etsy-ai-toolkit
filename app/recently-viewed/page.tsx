'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Clock3, Trash2 } from 'lucide-react'
import MobileMarketplaceNav from '@/components/marketplace/mobile-marketplace-nav'
import { clearRecentlyViewed, readRecentlyViewed, type RecentlyViewedItem } from '@/components/marketplace/recently-viewed-tracker'

export default function RecentlyViewedPage() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setItems(readRecentlyViewed())
    setReady(true)
  }, [])

  const clear = () => {
    clearRecentlyViewed()
    setItems([])
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <MobileMarketplaceNav brand="Craftly Marketplace" brandHref="/discover" />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Private on this device</p>
            <h1 className="mt-2 flex items-center gap-3 font-display text-4xl font-bold"><Clock3 className="h-8 w-8" />Recently viewed</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">A convenience list stored only in this browser. Craftly does not sync this list to your account or use it as a cross-site tracking profile.</p>
          </div>
          {items.length > 0 && <button type="button" onClick={clear} className="inline-flex h-10 items-center self-start rounded-lg border px-4 text-sm font-medium hover:bg-muted sm:self-auto"><Trash2 className="mr-2 h-4 w-4" />Clear history</button>}
        </div>

        {!ready ? (
          <div className="mt-10 rounded-3xl border border-dashed p-12 text-center text-muted-foreground">Loading local history…</div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed p-12 text-center">
            <Clock3 className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-semibold">No recently viewed products</h2>
            <p className="mt-2 text-sm text-muted-foreground">Products you open in Marketplace will appear here on this device.</p>
            <Link href="/discover" className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Explore products</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <article key={item.productId} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <Link href={`/shop/${item.storefrontSlug}/products/${item.productId}`} className="block">
                  <div className="aspect-square bg-muted bg-cover bg-center" style={item.image ? { backgroundImage: `url(${JSON.stringify(item.image).slice(1, -1)})` } : undefined}>{!item.image && <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Product image</div>}</div>
                  <div className="p-5">
                    <h2 className="line-clamp-2 font-display text-lg font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">by {item.storefrontName}</p>
                    <div className="mt-5 flex items-end justify-between gap-3">
                      <p className="font-semibold">{item.price == null ? 'Contact seller' : `${item.currency} ${Number(item.price).toFixed(2)}`}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.viewedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
