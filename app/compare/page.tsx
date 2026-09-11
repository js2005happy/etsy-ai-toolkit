import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Scale } from 'lucide-react'
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/wishlist" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1.5 h-4 w-4" />Saved products</Link>
          <Link href="/discover" className="font-display text-xl font-bold">Craftly Marketplace</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Buyer research</p>
          <h1 className="mt-2 flex items-center gap-3 font-display text-4xl font-bold"><Scale className="h-8 w-8" />Compare products</h1>
          <p className="mt-3 text-muted-foreground">Compare up to four public marketplace products. This view is informational only and does not rank sellers or recommend a winner.</p>
        </div>

        {items.length < 2 ? (
          <div className="mt-10 rounded-3xl border border-dashed p-12 text-center text-muted-foreground">Choose at least two currently public saved products from your wishlist to compare.</div>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="w-40 p-4 text-left font-medium text-muted-foreground">Attribute</th>
                  {items.map(({ storefront, product }) => {
                    const image = firstMarketplaceImage(product.images)
                    return (
                      <th key={product.id} className="min-w-56 p-4 text-left align-top">
                        <Link href={`/shop/${storefront.slug}/products/${product.id}`} className="block">
                          <div className="aspect-square rounded-xl bg-muted bg-cover bg-center" style={image ? { backgroundImage: `url(${JSON.stringify(image).slice(1, -1)})` } : undefined} />
                          <p className="mt-3 font-display text-lg font-semibold">{product.title}</p>
                          <p className="mt-1 text-xs font-normal text-muted-foreground">by {storefront.name}</p>
                        </Link>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="p-4 text-muted-foreground">Price</td>{items.map(({ storefront, product }) => <td key={product.id} className="p-4 font-medium">{product.price == null ? 'Contact seller' : `${product.currency || storefront.currency || 'USD'} ${Number(product.price).toFixed(2)}`}</td>)}</tr>
                <tr><td className="p-4 text-muted-foreground">Availability</td>{items.map(({ product }) => <td key={product.id} className="p-4">{product.inventory_quantity == null || Number(product.inventory_quantity) > 0 ? 'Available' : 'Sold out'}</td>)}</tr>
                <tr><td className="p-4 text-muted-foreground">Category</td>{items.map(({ product }) => <td key={product.id} className="p-4">{product.category || product.product_type || '—'}</td>)}</tr>
                <tr><td className="p-4 text-muted-foreground">Brand</td>{items.map(({ product }) => <td key={product.id} className="p-4">{product.brand || '—'}</td>)}</tr>
                <tr><td className="p-4 text-muted-foreground">Seller</td>{items.map(({ storefront }) => <td key={storefront.id} className="p-4"><Link href={`/shop/${storefront.slug}`} className="font-medium text-primary hover:underline">{storefront.name}</Link></td>)}</tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
