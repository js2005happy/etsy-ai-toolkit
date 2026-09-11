import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Search, Store } from 'lucide-react'
import { filterMarketplaceCatalog, firstMarketplaceImage, loadMarketplaceCatalog } from '@/lib/marketplace/public-catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Discover independent products | Craftly',
  description: 'Browse products from independent sellers using Craftly storefronts.',
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

export default async function DiscoverPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const query = readParam(params.q).slice(0, 120)
  const category = readParam(params.category).slice(0, 80)
  const catalog = await loadMarketplaceCatalog(300)
  const categories = Array.from(new Set(catalog.map(({ product }) => product.category).filter((value): value is string => Boolean(value)))).sort()
  const items = filterMarketplaceCatalog(catalog, query, category)
  const sellerCounts = new Map<string, { name: string; slug: string; count: number }>()
  for (const { storefront } of catalog) {
    const existing = sellerCounts.get(storefront.id)
    if (existing) existing.count += 1
    else sellerCounts.set(storefront.id, { name: storefront.name, slug: storefront.slug, count: 1 })
  }
  const featuredSellers = Array.from(sellerCounts.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 4)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="font-display text-xl font-bold">Craftly Marketplace</Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Discover</span>
            <Link href="/discover/sellers" className="text-muted-foreground hover:text-foreground">Sellers</Link>
            <Link href="/wishlist" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><Heart className="h-3.5 w-3.5" />Saved</Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Seller workspace</Link>
          </div>
        </div>
      </header>

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-5 py-14 md:py-20">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Craftly Marketplace Preview</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-6xl">Discover products from independent sellers.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Browse seller-published catalogs in one place, compare products, save favorites and explore independent storefronts. Checkout, escrow and buyer payments are not enabled yet.</p>

          <form className="mt-8 grid gap-3 rounded-2xl border bg-card p-4 shadow-sm md:grid-cols-[1fr_240px_auto]" method="get">
            <label className="flex items-center gap-2 rounded-xl border bg-background px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input name="q" defaultValue={query} maxLength={120} placeholder="Search products, brands or sellers" className="h-11 w-full bg-transparent text-sm outline-none" />
            </label>
            <select name="category" defaultValue={category} className="h-11 rounded-xl border bg-background px-3 text-sm">
              <option value="">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground" type="submit">Search</button>
          </form>

          {categories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/discover" className={`rounded-full border px-3 py-1.5 text-sm ${!category ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>All</Link>
              {categories.slice(0, 12).map((item) => <Link key={item} href={`/discover?category=${encodeURIComponent(item)}`} className={`rounded-full border px-3 py-1.5 text-sm ${category.toLowerCase() === item.toLowerCase() ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{item}</Link>)}
            </div>
          )}
        </div>
      </section>

      {!query && !category && featuredSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="text-sm font-medium text-primary">Independent storefronts</p><h2 className="mt-1 font-display text-2xl font-bold">Featured sellers</h2></div>
            <Link href="/discover/sellers" className="text-sm font-medium text-primary">Browse all sellers →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredSellers.map((seller) => <Link key={seller.slug} href={`/shop/${seller.slug}`} className="rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm"><Store className="h-5 w-5 text-primary" /><h3 className="mt-4 font-display text-lg font-semibold">{seller.name}</h3><p className="mt-1 text-sm text-muted-foreground">{seller.count} public {seller.count === 1 ? 'product' : 'products'}</p></Link>)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><p className="text-sm font-medium text-primary">Marketplace catalog</p><h2 className="mt-1 font-display text-2xl font-bold">{query || category ? 'Search results' : 'Latest products'}</h2></div>
          <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-12 text-center text-muted-foreground">No public products match this search yet.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(({ storefront, product }) => {
              const image = firstMarketplaceImage(product.images)
              const available = product.inventory_quantity == null || Number(product.inventory_quantity) > 0
              return (
                <article key={`${storefront.id}:${product.id}`} className="overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <Link href={`/shop/${storefront.slug}/products/${product.id}`} className="block">
                    <div className="aspect-square bg-muted bg-cover bg-center" style={image ? { backgroundImage: `url(${JSON.stringify(image).slice(1, -1)})` } : undefined}>
                      {!image && <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Product image</div>}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">{product.category || product.product_type || 'Independent product'}</p>
                      <h3 className="mt-1 line-clamp-2 font-display text-lg font-semibold">{product.title}</h3>
                      <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">by {storefront.name}</p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <p className="font-semibold">{product.price == null ? 'Contact seller' : `${product.currency || storefront.currency || 'USD'} ${Number(product.price).toFixed(2)}`}</p>
                        <span className={`text-xs ${available ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>{available ? 'Available' : 'Sold out'}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
