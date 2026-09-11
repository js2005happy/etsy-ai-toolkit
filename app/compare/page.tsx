import type { Metadata } from 'next'
import Link from 'next/link'
import { Scale } from 'lucide-react'
import MobileMarketplaceNav from '@/components/marketplace/mobile-marketplace-nav'
import { firstMarketplaceImage, loadMarketplaceCatalog } from '@/lib/marketplace/public-catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Compare products | Craftly',
  description: 'Compare saved marketplace products side by side.',
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function readIds(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] || '' : value || ''
  return Array.from(new Set(raw.split(',').map((item) => item.trim()).filter(Boolean))).slice(0, 4)
}

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const ids = readIds(params.ids)
  const catalog = await loadMarketplaceCatalog(500)
  const byId = new Map(catalog.map((item) => [item.product.id, item]))
  const items = ids.map((id) => byId.get(id)).filter(Boolean) as typeof catalog
  const unavailableCount = Math.max(0, ids.length - items.length)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <MobileMarketplaceNav brand="Craftly Marketplace" brandHref="/discover" />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Buyer research</p>
          <h1 className="mt-2 flex items-center gap-3 font-display text-4xl font-bold"><Scale className="h-8 w-8" aria-hidden="true" />Compare products</h1>
          <p className="mt-3 text-muted-foreground">Compare 2–4 public marketplace products. This view is informational only and does not rank sellers or recommend a winner.</p>
          {unavailableCount > 0 && <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{unavailableCount} selected {unavailableCount === 1 ? 'product is' : 'products are'} no longer public and {unavailableCount === 1 ? 'was' : 'were'} omitted.</p>}
        </div>

        {items.length < 2 ? (
          <div className="mt-10 rounded-3xl border border-dashed p-12 text-center"><Scale className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" /><h2 className="mt-4 font-display text-xl font-semibold">Choose at least two products</h2><p className="mt-2 text-sm text-muted-foreground">Select 2–4 currently public products from your wishlist before comparing.</p><Link href="/wishlist" className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Choose saved products</Link></div>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-2xl border bg-card" tabIndex={0} aria-label="Scrollable product comparison table">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <caption className="sr-only">Side-by-side comparison of selected Craftly Marketplace products.</caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="w-40 p-4 text-left font-medium text-muted-foreground">Attribute</th>
                  {items.map(({ storefront, product }) => {
                    const image = firstMarketplaceImage(product.images)
                    return <th scope="col" key={product.id} className="min-w-56 p-4 text-left align-top"><Link href={`/shop/${storefront.slug}/products/${product.id}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="aspect-square rounded-xl bg-muted bg-cover bg-center" style={image ? { backgroundImage: `url(${JSON.stringify(image).slice(1, -1)})` } : undefined}>{!image && <div className="flex h-full items-center justify-center text-xs font-normal text-muted-foreground">Product image</div>}</div><p className="mt-3 font-display text-lg font-semibold">{product.title}</p><p className="mt-1 text-xs font-normal text-muted-foreground">by {storefront.name}</p></Link></th>
                  })}
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><th scope="row" className="p-4 text-left font-normal text-muted-foreground">Price</th>{items.map(({ storefront, product }) => <td key={product.id} className="p-4 font-medium">{product.price == null ? 'Contact seller' : `${product.currency || storefront.currency || 'USD'} ${Number(product.price).toFixed(2)}`}</td>)}</tr>
                <tr><th scope="row" className="p-4 text-left font-normal text-muted-foreground">Availability</th>{items.map(({ product }) => <td key={product.id} className="p-4">{product.inventory_quantity == null || Number(product.inventory_quantity) > 0 ? 'Available' : 'Sold out'}</td>)}</tr>
                <tr><th scope="row" className="p-4 text-left font-normal text-muted-foreground">Category</th>{items.map(({ product }) => <td key={product.id} className="p-4">{product.category || product.product_type || '—'}</td>)}</tr>
                <tr><th scope="row" className="p-4 text-left font-normal text-muted-foreground">Brand</th>{items.map(({ product }) => <td key={product.id} className="p-4">{product.brand || '—'}</td>)}</tr>
                <tr><th scope="row" className="p-4 text-left font-normal text-muted-foreground">Seller</th>{items.map(({ storefront }) => <td key={storefront.id} className="p-4"><Link href={`/shop/${storefront.slug}`} className="font-medium text-primary hover:underline">{storefront.name}</Link></td>)}</tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
