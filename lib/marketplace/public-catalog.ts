import { createServiceClient } from '@/lib/supabase/service'

export type PublicStorefront = {
  id: string
  user_id: string
  slug: string
  name: string
  headline: string | null
  description: string | null
  logo_url: string | null
  currency: string | null
}

export type PublicProduct = {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string | null
  product_type: string | null
  brand: string | null
  price: number | null
  currency: string | null
  inventory_quantity: number | null
  images: unknown
  tags: unknown
}

export type MarketplaceCatalogItem = {
  storefront: PublicStorefront
  product: PublicProduct
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export function firstMarketplaceImage(value: unknown): string | null {
  const images = Array.isArray(value) ? value : []
  const first = images[0]
  if (typeof first === 'string' && /^https:\/\//i.test(first)) return first
  if (first && typeof first === 'object' && 'url' in first) {
    const url = String((first as { url?: unknown }).url || '')
    if (/^https:\/\//i.test(url)) return url
  }
  return null
}

export async function loadMarketplaceCatalog(limit = 120): Promise<MarketplaceCatalogItem[]> {
  const service = createServiceClient()
  const { data: storefrontRows } = await service
    .from('storefronts')
    .select('id,user_id,slug,name,headline,description,logo_url,currency')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(50)

  const storefronts = (storefrontRows ?? []) as PublicStorefront[]
  if (!storefronts.length) return []

  const storefrontById = new Map(storefronts.map((storefront) => [storefront.id, storefront]))
  const { data: selectionRows } = await service
    .from('storefront_products')
    .select('storefront_id,product_id,sort_order')
    .in('storefront_id', storefronts.map((storefront) => storefront.id))
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .limit(limit)

  const selections = (selectionRows ?? []) as Array<{ storefront_id: string; product_id: string; sort_order: number }>
  if (!selections.length) return []

  const productIds = Array.from(new Set(selections.map((selection) => selection.product_id)))
  const { data: productRows } = await service
    .from('products')
    .select('id,user_id,title,description,category,product_type,brand,price,currency,inventory_quantity,images,tags')
    .eq('status', 'ready')
    .in('id', productIds)

  const products = (productRows ?? []) as PublicProduct[]
  const productById = new Map(products.map((product) => [product.id, product]))

  return selections.flatMap((selection) => {
    const storefront = storefrontById.get(selection.storefront_id)
    const product = productById.get(selection.product_id)
    if (!storefront || !product || product.user_id !== storefront.user_id) return []
    return [{ storefront, product }]
  })
}

export function filterMarketplaceCatalog(items: MarketplaceCatalogItem[], query: string, category: string) {
  const q = query.trim().toLowerCase()
  const normalizedCategory = category.trim().toLowerCase()
  return items.filter(({ storefront, product }) => {
    if (normalizedCategory && String(product.category || '').toLowerCase() !== normalizedCategory) return false
    if (!q) return true
    const haystack = [
      product.title,
      product.description,
      product.category,
      product.product_type,
      product.brand,
      storefront.name,
      ...asStringArray(product.tags),
    ].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(q)
  })
}
