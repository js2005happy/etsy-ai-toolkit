import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { firstMarketplaceImage, type PublicProduct, type PublicStorefront } from '@/lib/marketplace/public-catalog'

export const dynamic = 'force-dynamic'

type PageParams = Promise<{ slug: string; productId: string }>

async function loadPublicProduct(slug: string, productId: string) {
  const service = createServiceClient()
  const { data: storefrontRow } = await service
    .from('storefronts')
    .select('id,user_id,slug,name,headline,description,logo_url,currency')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  const storefront = storefrontRow as PublicStorefront | null
  if (!storefront) return null

  const { data: membership } = await service
    .from('storefront_products')
    .select('product_id')
    .eq('storefront_id', storefront.id)
    .eq('product_id', productId)
    .eq('is_visible', true)
    .maybeSingle()
  if (!membership) return null

  const { data: productRow } = await service
    .from('products')
    .select('id,user_id,title,description,category,product_type,brand,price,currency,inventory_quantity,images,tags,material,style,facts')
    .eq('id', productId)
    .eq('user_id', storefront.user_id)
    .eq('status', 'ready')
    .maybeSingle()

  if (!productRow) return null
  return { storefront, product: productRow as PublicProduct & { material?: string | null; style?: string | null; facts?: unknown } }
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug, productId } = await params
  const loaded = await loadPublicProduct(slug, productId)
  if (!loaded) return { title: 'Product not found | Craftly' }
  const { storefront, product } = loaded
  return {
    title: `${product.title} | ${storefront.name} on Craftly`,
    description: product.description || `View ${product.title} from ${storefront.name} on Craftly.`,
  }
}

export default async function PublicProductPage({ params }: { params: PageParams }) {
  const { slug, productId } = await params
  const loaded = await loadPublicProduct(slug, productId)
  if (!loaded) notFound()
  const { storefront, product } = loaded
  const image = firstMarketplaceImage(product.images)
  const available = product.inventory_quantity == null || Number(product.inventory_quantity) > 0
  const facts = product.facts && typeof product.facts === 'object' && !Array.isArray(product.facts)
    ? Object.entries(product.facts as Record<string, unknown>).slice(0, 12)
    : []

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href={`/shop/${storefront.slug}`} className="font-display text-xl font-bold">{storefront.name}</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/discover" className="text-muted-foreground hover:text-foreground">Discover</Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground">Craftly</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:py-16">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl border bg-muted bg-cover bg-center" style={image ? { backgroundImage: `url(${JSON.stringify(image).slice(1, -1)})` } : undefined}>
            {!image && <div className="flex h-full items-center justify-center text-muted-foreground">Product image</div>}
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">{product.category || product.product_type || 'Independent product'}</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">{product.title}</h1>
          <Link href={`/shop/${storefront.slug}`} className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground">Sold by {storefront.name}</Link>

          <div className="mt-7 flex items-center justify-between gap-4 border-y py-5">
            <p className="text-2xl font-semibold">{product.price == null ? 'Contact seller' : `${product.currency || storefront.currency || 'USD'} ${Number(product.price).toFixed(2)}`}</p>
            <span className={`rounded-full px-3 py-1 text-sm ${available ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>{available ? 'Available' : 'Sold out'}</span>
          </div>

          {product.description && <p className="mt-7 whitespace-pre-wrap text-base leading-7 text-muted-foreground">{product.description}</p>}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {product.brand && <div className="rounded-xl border p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Brand</p><p className="mt-1 font-medium">{product.brand}</p></div>}
            {product.material && <div className="rounded-xl border p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Material</p><p className="mt-1 font-medium">{product.material}</p></div>}
            {product.style && <div className="rounded-xl border p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Style</p><p className="mt-1 font-medium">{product.style}</p></div>}
            {product.product_type && <div className="rounded-xl border p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Type</p><p className="mt-1 font-medium">{product.product_type}</p></div>}
          </div>

          {facts.length > 0 && (
            <div className="mt-8 rounded-2xl border bg-card p-5">
              <h2 className="font-display text-lg font-semibold">Verified product details</h2>
              <dl className="mt-4 divide-y">
                {facts.map(([key, value]) => <div key={key} className="grid grid-cols-[140px_1fr] gap-4 py-3 text-sm"><dt className="text-muted-foreground">{key}</dt><dd className="font-medium">{Array.isArray(value) ? value.join(', ') : String(value ?? '')}</dd></div>)}
              </dl>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-6 text-muted-foreground">
            Craftly is showing this seller's published catalog. Checkout, escrow, payment collection and buyer protection are not enabled in this marketplace preview. Contact or purchase through the seller's supported channel only after reviewing their terms.
          </div>
        </div>
      </section>
    </main>
  )
}
