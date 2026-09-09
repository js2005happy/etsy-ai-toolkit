export type ProductContextListing = {
  id: number
  title: string
  description: string
  tags: string[]
}

export function productContextText(listing: ProductContextListing): string {
  return [
    listing.description,
    listing.tags.length ? `Tags: ${listing.tags.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

export async function loadProductContextFromLocation(): Promise<ProductContextListing | null> {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  if (params.get('source') !== 'product-context') return null

  const listingId = params.get('listing_id')?.trim() ?? ''
  if (!/^\d+$/.test(listingId)) return null

  const response = await fetch(`/api/etsy/listings/${listingId}`)
  if (!response.ok) return null

  const payload = await response.json().catch(() => null)
  const listing = payload?.listing
  if (!listing || !Number.isSafeInteger(Number(listing.id))) return null

  return {
    id: Number(listing.id),
    title: typeof listing.title === 'string' ? listing.title : '',
    description: typeof listing.description === 'string' ? listing.description : '',
    tags: Array.isArray(listing.tags)
      ? listing.tags.filter((tag: unknown): tag is string => typeof tag === 'string')
      : [],
  }
}
