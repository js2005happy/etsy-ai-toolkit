import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

async function loadStorefront(slug: string) {
  const service = createServiceClient()
  const { data: storefront } = await service
    .from('storefronts')
    .select('id,user_id,slug,name,headline,description,logo_url,banner_url,contact_email,currency,is_published,seo_title,seo_description')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  if (!storefront) return null

  const { data: selections } = await service
    .from('storefront_products')
    .select('product_id,sort_order')
    .eq('storefront_id', storefront.id)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  const ids = (selections ?? []).map((row: any) => row.product_id)
  if (!ids.length) return { storefront, products: [] }

  const { data: products } = await service
    .from('products')
    .select('id,title,description,product_type,brand,price,currency,inventory_quantity,images,status')
    .eq('user_id', storefront.user_id)
    .eq('status', 'ready')
    .in('id', ids)

  const byId = new Map((products ?? []).map((product: any) => [product.id, product]))
  return { storefront, products: ids.map((id: string) => byId.get(id)).filter(Boolean) }
}

function firstImage(product: any): string | null {
  const images = Array.isArray(product?.images) ? product.images : []
  const first = images[0]
  if (typeof first === 'string' && /^https:\/\//i.test(first)) return first
  if (first && typeof first.url === 'string' && /^https:\/\//i.test(first.url)) return first.url
  return null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadStorefront(slug)
  if (!loaded) return { title: 'Store not found | Craftly' }
  const { storefront } = loaded
  return {
    title: storefront.seo_title || `${storefront.name} | Craftly Store`,
    description: storefront.seo_description || storefront.description || storefront.headline || `Shop ${storefront.name} on Craftly.`,
  }
}

export default async function PublicStorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const loaded = await loadStorefront(slug)
  if (!loaded) notFound()
  const { storefront, products } = loaded

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href={`/shop/${storefront.slug}`} className="font-display text-xl font-bold">{storefront.name}</Link>
          <Link href="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">Powered by Craftly</Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b bg-muted/30">
        {storefront.banner_url && /^https:\/\//i.test(storefront.banner_url) && (
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${JSON.stringify(storefront.banner_url).slice(1, -1)})` }} />
        )}
        <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Independent seller storefront</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">{storefront.headline || storefront.name}</h1>
            {storefront.description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{storefront.description}</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div><p className="text-sm font-medium text-primary">Catalog</p><h2 className="mt-1 font-display text-2xl font-bold">Products</h2></div>
          <p className="text-sm text-muted-foreground">{products.length} {products.length === 1 ? 'item' : 'items'}</p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-12 text-center text-muted-foreground">This seller has not published any products to their Craftly storefront yet.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: any) => {
              const image = firstImage(product)
              const available = product.inventory_quantity == null || Number(product.inventory_quantity) > 0
              return (
                <article key={product.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                  <div className="aspect-square bg-muted bg-cover bg-center" style={image ? { backgroundImage: `url(${JSON.stringify(image).slice(1, -1)})` } : undefined}>
                    {!image && <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Product image</div>}
                  </div>
                  <div className="p-5">
                    {product.product_type && <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.product_type}</p>}
                    <h3 className="mt-1 line-clamp-2 font-display text-lg font-semibold">{product.title}</h3>
                    {product.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{product.description}</p>}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <p className="font-semibold">{product.price == null ? 'Contact seller' : `${product.currency || storefront.currency || 'USD'} ${Number(product.price).toFixed(2)}`}</p>
                      <span className={`text-xs ${available ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>{available ? 'Available' : 'Sold out'}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-12 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          This storefront is a seller catalog. Checkout is not enabled in this release; no payment or escrow is processed by Craftly here.
          {storefront.contact_email && <> Contact the seller at <a className="font-medium text-primary hover:underline" href={`mailto:${storefront.contact_email}`}>{storefront.contact_email}</a>.</>}
        </div>
      </section>
    </main>
  )
}
