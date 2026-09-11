import { putEbayInventoryItem, createEbayOffer, publishEbayOffer } from '@/lib/ebay'
import { evaluateProductReadiness } from '@/lib/product-readiness'
import type { CommercePlatformAdapter, PlatformConnectionStatus, ValidationIssue } from '@/lib/commerce/adapter'
import type { CanonicalProduct, PlatformListing } from '@/lib/commerce/types'

export type EbayResolvedConnection = {
  accessToken: string
  accountLabel?: string
  marketplaceId: string
  merchantLocationKey: string
  fulfillmentPolicyId: string
  paymentPolicyId: string
  returnPolicyId: string
  categoryId?: string
}
export type EbayConnectionResolver = (userId: string) => Promise<EbayResolvedConnection | null>

function validation(product: CanonicalProduct): ValidationIssue[] {
  const issues = evaluateProductReadiness(product, 'ebay').issues.map((issue) => ({ field: issue.field, severity: issue.severity, message: issue.message }))
  if (!product.sku) issues.push({ field: 'sku', severity: 'error', message: 'eBay Inventory API requires a stable SKU.' })
  if (product.price == null) issues.push({ field: 'price', severity: 'error', message: 'eBay publishing requires a verified price.' })
  return issues
}

function transform(product: CanonicalProduct): PlatformListing {
  return {
    platform: 'ebay',
    title: product.title.slice(0, 80),
    description: product.description || '',
    keywords: product.tags?.slice(0, 20) || [],
    attributes: { ...(product.facts || {}), sku: product.sku },
    price: product.price,
    currency: product.currency,
    inventoryQuantity: product.inventoryQuantity,
    images: product.images,
    status: 'draft',
    sourceProductId: product.id,
  }
}

export function createEbayCommerceAdapter(resolveConnection: EbayConnectionResolver): CommercePlatformAdapter {
  return {
    id: 'ebay',
    label: 'eBay',
    async getConnectionStatus(userId): Promise<PlatformConnectionStatus> {
      const connection = await resolveConnection(userId)
      return connection ? { connected: true, accountLabel: connection.accountLabel, scopes: ['sell.inventory', 'sell.account'] } : { connected: false }
    },
    validateProduct: validation,
    transformProduct: transform,
    async publish(userId, listing) {
      const connection = await resolveConnection(userId)
      if (!connection) return { ok: false, platform: 'ebay', error: 'eBay is not connected or its publishing policies are incomplete.' }
      const sku = String(listing.attributes?.sku || '').trim()
      const categoryId = String(listing.attributes?.categoryId || connection.categoryId || '').trim()
      if (!sku) return { ok: false, platform: 'ebay', error: 'eBay publish requires a SKU.' }
      if (!categoryId) return { ok: false, platform: 'ebay', error: 'Choose an eBay category before publishing.' }
      if (listing.price == null || !listing.currency) return { ok: false, platform: 'ebay', error: 'eBay publish requires price and currency.' }
      const quantity = listing.inventoryQuantity ?? 0
      try {
        const aspects: Record<string, string[]> = {}
        for (const [key, value] of Object.entries(listing.attributes || {})) {
          if (['sku','categoryId','condition'].includes(key) || value == null) continue
          aspects[key] = Array.isArray(value) ? value.map(String) : [String(value)]
        }
        await putEbayInventoryItem(connection.accessToken, {
          sku,
          title: listing.title,
          description: listing.description,
          quantity,
          condition: String(listing.attributes?.condition || 'NEW'),
          imageUrls: listing.images?.map((image) => image.url),
          aspects,
        })
        const offerId = await createEbayOffer(connection.accessToken, {
          sku,
          marketplaceId: connection.marketplaceId,
          categoryId,
          merchantLocationKey: connection.merchantLocationKey,
          quantity,
          price: { value: String(listing.price), currency: listing.currency },
          fulfillmentPolicyId: connection.fulfillmentPolicyId,
          paymentPolicyId: connection.paymentPolicyId,
          returnPolicyId: connection.returnPolicyId,
        })
        const published = await publishEbayOffer(connection.accessToken, offerId)
        return { ok: true, platform: 'ebay', externalId: published.listingId }
      } catch (error: any) {
        return { ok: false, platform: 'ebay', error: error.message || 'eBay publish failed' }
      }
    },
  }
}
