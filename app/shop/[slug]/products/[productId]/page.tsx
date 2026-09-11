import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BadgeCheck, Info, Mail, PackageCheck } from 'lucide-react'
import WishlistButton from '@/components/marketplace/wishlist-button'
import ReportListingButton from '@/components/marketplace/report-listing-button'
import MobileMarketplaceNav from '@/components/marketplace/mobile-marketplace-nav'
import RecentlyViewedTracker from '@/components/marketplace/recently-viewed-tracker'
import { createServiceClient } from '@/lib/supabase/service'
import { firstMarketplaceImage, loadMarketplaceCatalog, type PublicProduct, type PublicStorefront } from '@/lib/marketplace/public-catalog'

export const dynamic = 'force-dynamic'

type PageParams = Promise<{ slug: string; productId: string }>

async function loadPublicProduct(slug: string, productId: string) {
  const service = createServiceClient()
  const { data: storefrontRow } = await service
    .from('storefronts')
    .select('id,user_id,slug,name,headline,description,logo_url,currency,contact_email,created_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  const storefront = storefrontRow as (PublicStorefront & { contact_email?: string | null; created_at?: string | null }) | null
  if (!storefront) return null
  const { data: membership } = await service.from('storefront_products').select('product_id').eq('storefront_id', storefront.id).eq('product_id', productId).eq('is_visible', true).maybeSingle()
  if (!membership) return null
  const { data: productRow } = await service.from('products').select('id,user_id,title,description,category,product_type,brand,price,currency,inventory_quantity,images,tags,material,style,facts').eq('id', productId).eq('user_id', storefront.user_id).eq('status', 'ready').maybeSingle()
  if (!productRow) return null
  return { storefront, product: productRow as PublicProduct & { material?: string | null; style?: string | null; facts?: unknown } }
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug, productId } = await params
  const loaded = await loadPublicProduct(slug, productId)
  if (!loaded) return { title: 'Product not found | Craftly' }
  const { storefront, product } = loaded
  return { title: `${product.title} | ${storefront.name} on Craftly`, description: product.description || `View ${product.title} from ${storefront.name} on Craftly.` }
}

export default async function PublicProductPage({ params }: { params: PageParams }) {
  const { slug, productId } = await params
  const loaded = await loadPublicProduct(slug, productId)
  if (!loaded) notFound()
  const { storefront, product } = loaded
  const image = firstMarketplaceImage(product.images)
  const available = product.inventory_quantity == null || Number(product.inventory_quantity) > 0
  const facts = product.facts && typeof product.facts === 'object' && !Array.isArray(product.facts) ? Object.entries(product.facts as Record<string, unknown>).slice(0, 12) : []
  const catalog = await loadMarketplaceCatalog(300)
  const related = catalog.filter((item) => item.storefront.id === storefront.id && item.product.id !== product.id).slice(0, 4)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <RecentlyViewedTracker item={{ productId: product.id, storefrontSlug: storefront.slug, storefrontName: storefront.name, title: product.title, image, price: product.price == null ? null : Number(product.price), currency: product.currency || storefront.currency || 'USD' }} />
      <MobileMarketplaceNav brand={storefront.name} brandHref={`/shop/${storefront.slug}`} />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:py-16">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl border bg-muted bg-cover bg-center" style={image ? { backgroundImage: `url(${JSON.stringify(image).slice(1, -1)})` } : undefined}>{!image && <div className="flex h-full items-center justify-center text-muted-foreground">Product image</div>}</div>
          <div className="mt-5 rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2"><Info className="h-4 w-4 text-primary" aria-hidden="true" /><p className="text-sm font-medium">Marketplace trust context</p></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Public product details</p><p className="mt-1 font-medium">{facts.length} structured {facts.length === 1 ? 'fact' : 'facts'}</p></div><div><p className="text-xs text-muted-foreground">Inventory signal</p><p className="mt-1 font-medium">{available ? 'Currently available' : 'Seller marks sold out'}</p></div><div><p className="text-xs text-muted-foreground">Seller contact</p><p className="mt-1 font-medium">{storefront.contact_email ? 'Provided' : 'Not provided'}</p></div></div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">These are evidence signals from the seller&apos;s current Craftly data. They are not an identity, authenticity, quality, delivery, or legal-compliance verification badge.</p>
          </div>
        </div>
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">{product.category || product.product_type || 'Independent product'}</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">{product.title}</h1>
          <Link href={`/shop/${storefront.slug}`} className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground">Sold by {storefront.name}</Link>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y py-5"><p className="text-2xl font-semibold">{product.price == null ? 'Contact seller' : `${product.currency || storefront.currency || 'USD'} ${Number(product.price).toFixed(2)}`}</p><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-sm ${available ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>{available ? 'Available' : 'Sold out'}</span><WishlistButton storefrontId={storefront.id} productId={product.id} /></div></div>
          {product.description && <p className="mt-7 whitespace-pre-wrap text-base leading-7 text-muted-foreground">{product.description}</p>}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">{product.brand && <div className="rounded-xl border p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Brand</p><p className="mt-1 font-medium">{product.brand}</p></div>}{product.material && <div className="rounded-xl border p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Material</p><p className="mt-1 font-medium">{product.material}</p></div>}{product.style && <div className="rounded-xl border p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Style</p><p className="mt-1 font-medium">{product.style}</p></div>}{product.product_type && <div className="rounded-xl border p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Type</p><p className="mt-1 font-medium">{product.product_type}</p></div>}</div>
          {facts.length > 0 && <div className="mt-8 rounded-2xl border bg-card p-5"><div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" aria-hidden="true" /><h2 className="font-display text-lg font-semibold">Seller-provided product details</h2></div><dl className="mt-4 divide-y">{facts.map(([key, value]) => <div key={key} className="grid grid-cols-[120px_1fr] gap-4 py-3 text-sm sm:grid-cols-[140px_1fr]"><dt className="text-muted-foreground">{key}</dt><dd className="break-words font-medium">{Array.isArray(value) ? value.join(', ') : String(value ?? '')}</dd></div>)}</dl></div>}
          <div className="mt-8 rounded-2xl border bg-card p-5 text-sm leading-6"><p className="font-medium">Seller information</p>{storefront.description && <p className="mt-2 text-muted-foreground">{storefront.description}</p>}<div className="mt-3 flex flex-wrap gap-3"><Link href={`/shop/${storefront.slug}`} className="font-medium text-primary hover:underline"><PackageCheck className="mr-1 inline h-4 w-4" aria-hidden="true" />Visit storefront</Link>{storefront.contact_email && <a href={`mailto:${storefront.contact_email}`} className="font-medium text-primary hover:underline"><Mail className="mr-1 inline h-4 w-4" aria-hidden="true" />Contact seller</a>}</div><div className="mt-4 border-t pt-4"><ReportListingButton storefrontId={storefront.id} productId={product.id} /></div></div>
          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-6 text-muted-foreground">Craftly is showing this seller&apos;s published catalog. Checkout, escrow, payment collection and buyer protection are not enabled in this marketplace preview. Saving a product does not reserve inventory or create an order.</div>
        </div>
      </section>
      {related.length > 0 && <section className="mx-auto max-w-7xl border-t px-5 py-12"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">More from this seller</p><h2 className="mt-1 font-display text-2xl font-bold">You may also like</h2></div><Link href={`/shop/${storefront.slug}`} className="text-sm font-medium text-primary">View storefront →</Link></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{related.map(({ product: item }) => { const relatedImage = firstMarketplaceImage(item.images); return <Link key={item.id} href={`/shop/${storefront.slug}/products/${item.id}`} className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="aspect-square bg-muted bg-cover bg-center" style={relatedImage ? { backgroundImage: `url(${JSON.stringify(relatedImage).slice(1, -1)})` } : undefined} /><div className="p-4"><p className="line-clamp-2 font-medium">{item.title}</p><p className="mt-2 text-sm text-muted-foreground">{item.price == null ? 'Contact seller' : `${item.currency || storefront.currency || 'USD'} ${Number(item.price).toFixed(2)}`}</p></div></Link> })}</div></section>}
    </main>
  )
}
