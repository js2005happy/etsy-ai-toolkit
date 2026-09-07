export type ListingHealth = {
  score: number
  breakdown: { title: number; description: number; tags: number; images: number; attributes: number }
  issues: string[]
}

/** Craftly's transparent heuristic; it is not an Etsy ranking score. */
export function scoreListing(listing: {
  title?: string | null; description?: string | null; tags?: unknown; images?: unknown; attributes?: unknown
}): ListingHealth {
  const title = listing.title?.trim() ?? ''
  const description = listing.description?.trim() ?? ''
  const tags = Array.isArray(listing.tags) ? listing.tags.filter((tag) => typeof tag === 'string') : []
  const images = Array.isArray(listing.images) ? listing.images : []
  const attributes = Array.isArray(listing.attributes) ? listing.attributes : []
  const breakdown = {
    title: Math.min(20, title.length >= 20 ? 20 : title.length),
    description: Math.min(20, Math.floor(description.length / 40)),
    tags: Math.min(20, Math.floor(tags.length / 13 * 20)),
    images: Math.min(20, images.length * 4),
    attributes: Math.min(20, attributes.length * 5),
  }
  const issues: string[] = []
  if (title.length < 20) issues.push('Add a clearer, more specific title.')
  if (description.length < 160) issues.push('Add useful detail to the description.')
  if (tags.length < 13) issues.push(`Add ${13 - tags.length} more relevant tag${13 - tags.length === 1 ? '' : 's'}.`)
  if (images.length < 3) issues.push('Add more product images.')
  if (attributes.length === 0) issues.push('Add relevant Etsy attributes.')
  return { score: Object.values(breakdown).reduce((total, value) => total + value, 0), breakdown, issues }
}
