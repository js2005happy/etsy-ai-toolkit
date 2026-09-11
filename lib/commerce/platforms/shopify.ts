import { createProduct } from '@/lib/shopify'
import { evaluateProductReadiness } from '@/lib/product-readiness'
import type { CommercePlatformAdapter, PlatformConnectionStatus, ValidationIssue } from '@/lib/commerce/adapter'
import type { CanonicalProduct, PlatformListing } from '@/lib/commerce/types'

export type ShopifyResolvedConnection = { shopDomain: string; accessToken: string; label?: string; scopes?: string[] }
export type ShopifyConnectionResolver = (userId: string) => Promise<ShopifyResolvedConnection | null>

function validation(product: CanonicalProduct): ValidationIssue[] {
  const readiness = evaluateProductReadiness(product, 'shopify')
  return readiness.issues.map((issue) => ({ field: issue.field, severity: issue.severity, message: issue.message }))
}

function transform(product: CanonicalProduct): PlatformListing {
  return {
    platform: 'shopify',
    title: product.title.slice(0, 255),
    description: product.description || '',
    keywords: product.tags?.slice(0, 50) || [],
    attributes: product.facts || {},
    price: product.price,
    currency: product.currency,
    inventoryQuantity: product.inventoryQuantity,
    images: product.images,
    status: 'draft',
    sourceProductId: product.id,
  }
}

export function createShopifyCommerceAdapter(resolveConnection: ShopifyConnectionResolver): CommercePlatformAdapter {
  return {
    id: 'shopify',
    label: 'Shopify',
    async getConnectionStatus(userId): Promise<PlatformConnectionStatus> {
      const connection = await resolveConnection(userId)
      return connection ? { connected: true, accountLabel: connection.label || connection.shopDomain, scopes: connection.scopes } : { connected: false }
    },
    validateProduct: validation,
    transformProduct: transform,
    async publish(userId, listing) {
      const connection = await resolveConnection(userId)
      if (!connection) return { ok: false, platform: 'shopify', error: 'Shopify is not connected.' }
      try {
        const product = await createProduct(connection.shopDomain, connection.accessToken, {
          title: listing.title,
          description: listing.description,
          tags: listing.keywords,
          price: listing.price == null ? undefined : String(listing.price),
          images: listing.images?.map((image) => image.url),
          status: 'draft',
        })
        return { ok: true, platform: 'shopify', externalId: String(product.id), externalUrl: product.admin_graphql_api_id ? undefined : undefined }
      } catch (error: any) {
        return { ok: false, platform: 'shopify', error: error.message || 'Shopify publish failed' }
      }
    },
  }
}
