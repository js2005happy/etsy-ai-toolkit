import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Heart, Scale } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { firstMarketplaceImage, loadMarketplaceCatalog } from '@/lib/marketplace/public-catalog'
import WishlistRemoveButton from '@/components/marketplace/wishlist-remove-button'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Saved products | Craftly',
  description: 'Products you saved while browsing Craftly Marketplace.',
}

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=%2Fwishlist')

  const service = createServiceClient()
  const { data: savedRows } = await service
    .from('marketplace_wishlist_items')
    .select('product_id,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  const saved = savedRows ?? []
  const order = new Map(saved.map((row: any, index: number) => [row.product_id, index]))
  const catalog = await loadMarketplaceCatalog(500)
  const items = catalog
    .filter(({ product }) => order.has(product.id))
    .sort((a, b) => Number(order.get(a.product.id) ?? 9999) - Number(order.get(b.product.id) ?? 9999))
  const staleCount = Math.max(0, saved.length - items.length)
  const compareIds = items.slice(0, 4).map(({ product }) => product.id).join(',')

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/discover" className="font-display text-xl font-bold">Craftly Marketplace</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/discover" className="text-muted-foreground hover:text-foreground">Discover</Link>
            <Link href="/discover/sellers" className="text-muted-foreground hover:text-foreground">Sellers</Link>
            <span className="font-medium">Saved</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Your wishlist</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Saved products</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">A private shortlist of marketplace products you may want to revisit. Saving does not reserve stock or create an order.</p>
            {staleCount > 0 && <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{staleCount} saved {staleCount === 1 ? 'item is' : 'items are'} currently unavailable or no longer public and therefore hidden.</p>}
          </div>
          <div className="flex items-center gap-3">
            {items.length >= 2 && <Link href={`/compare?ids=${encodeURIComponent(compareIds)}`} className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"><Scale className="mr-2 h-4 w-4" />Compare first {Math.min(items.length, 4)}</Link>}
            <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed p-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-semibold">Nothing saved yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Browse independent products and save the ones you want to compare later.</p>
            <Link href="/discover" className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Explore products</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(({ storefront, product }) => {
              const image = firstMarketplaceImage(product.images)
              const available = product.inventory_quantity == null || Number(product.inventory_quantity) > 0
              return (
                <article key={`${storefront.id}:${product.id}`} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                  <Link href={`/shop/${storefront.slug}/products/${product.id}`} className="block">
                    <div className="aspect-square bg-muted bg-cover bg-center" style={image ? { backgroundImage: `url(${JSON.stringify(image).slice(1, -1)})` } : undefined}>
                      {!image && <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Product image</div>}
                    </div>
                    <div className="p-5 pb-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">{product.category || product.product_type || 'Independent product'}</p>
                      <h2 className="mt-1 line-clamp-2 font-display text-lg font-semibold">{product.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">by {storefront.name}</p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <p className="font-semibold">{product.price == null ? 'Contact seller' : `${product.currency || storefront.currency || 'USD'} ${Number(product.price).toFixed(2)}`}</p>
                        <span className={`text-xs ${available ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>{available ? 'Available' : 'Sold out'}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center justify-end border-t px-5 py-3"><WishlistRemoveButton productId={product.id} /></div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
