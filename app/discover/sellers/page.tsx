import type { Metadata } from 'next'
import Link from 'next/link'
import { Store } from 'lucide-react'
import MobileMarketplaceNav from '@/components/marketplace/mobile-marketplace-nav'
import { firstMarketplaceImage, loadMarketplaceCatalog } from '@/lib/marketplace/public-catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Independent sellers | Craftly',
  description: 'Browse independent seller storefronts on Craftly Marketplace.',
}

export default async function SellersPage() {
  const catalog = await loadMarketplaceCatalog(500)
  const grouped = new Map<string, { storefront: (typeof catalog)[number]['storefront']; products: (typeof catalog)[number]['product'][] }>()
  for (const item of catalog) {
    const current = grouped.get(item.storefront.id)
    if (current) current.products.push(item.product)
    else grouped.set(item.storefront.id, { storefront: item.storefront, products: [item.product] })
  }
  const sellers = Array.from(grouped.values()).sort((a, b) => b.products.length - a.products.length || a.storefront.name.localeCompare(b.storefront.name))

  return (
    <main className="min-h-screen bg-background text-foreground">
      <MobileMarketplaceNav brand="Craftly Marketplace" brandHref="/discover" />
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-5 py-14 md:py-20">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Seller directory</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-6xl">Meet the independent sellers behind the products.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Every seller shown here has a published Craftly storefront and at least one visible, ready product in the marketplace catalog.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10" aria-labelledby="seller-directory-heading">
        <div className="sr-only" id="seller-directory-heading">Marketplace seller directory</div>
        {sellers.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-12 text-center"><Store className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-4 font-display text-xl font-semibold">No published sellers yet</h2><p className="mt-2 text-sm text-muted-foreground">Published seller storefronts with ready products will appear here.</p><Link href="/discover" className="mt-5 inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium">Browse products</Link></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sellers.map(({ storefront, products }) => {
              const cover = firstMarketplaceImage(products.find((product) => firstMarketplaceImage(product.images))?.images)
              const categories = Array.from(new Set(products.map((product) => product.category).filter((value): value is string => Boolean(value)))).slice(0, 4)
              return (
                <article key={storefront.id} className="overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="h-36 bg-muted bg-cover bg-center" style={cover ? { backgroundImage: `url(${JSON.stringify(cover).slice(1, -1)})` } : undefined}>{!cover && <div className="flex h-full items-center justify-center"><Store className="h-8 w-8 text-muted-foreground" aria-hidden="true" /></div>}</div>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {storefront.logo_url && /^https:\/\//i.test(storefront.logo_url) ? <div className="h-12 w-12 shrink-0 rounded-xl border bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(storefront.logo_url).slice(1, -1)})` }} aria-hidden="true" /> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted"><Store className="h-5 w-5" aria-hidden="true" /></div>}
                      <div className="min-w-0"><h2 className="font-display text-xl font-semibold">{storefront.name}</h2><p className="mt-1 text-sm text-muted-foreground">{products.length} public {products.length === 1 ? 'product' : 'products'}</p></div>
                    </div>
                    {storefront.headline && <p className="mt-4 font-medium">{storefront.headline}</p>}
                    {storefront.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{storefront.description}</p>}
                    {categories.length > 0 && <div className="mt-4 flex flex-wrap gap-2" aria-label="Seller categories">{categories.map((category) => <span key={category} className="rounded-full bg-muted px-2.5 py-1 text-xs">{category}</span>)}</div>}
                    <Link href={`/shop/${storefront.slug}`} className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Visit storefront</Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
