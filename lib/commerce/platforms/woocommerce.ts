import { createWooProduct, type WooCommerceCredentials } from '@/lib/woocommerce'
import { evaluateProductReadiness } from '@/lib/product-readiness'
import type { CommercePlatformAdapter, PlatformConnectionStatus, ValidationIssue } from '@/lib/commerce/adapter'
import type { CanonicalProduct, PlatformListing } from '@/lib/commerce/types'

export type WooResolvedConnection = { storeUrl: string; credentials: WooCommerceCredentials; label?: string }
export type WooConnectionResolver = (userId: string) => Promise<WooResolvedConnection | null>

function validation(product: CanonicalProduct): ValidationIssue[] {
  return evaluateProductReadiness(product, 'woocommerce').issues.map((issue) => ({ field: issue.field, severity: issue.severity, message: issue.message }))
}

function transform(product: CanonicalProduct): PlatformListing {
  const facts = Object.entries(product.facts || {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value ?? '')}`)
  return {
    platform: 'woocommerce',
    title: product.title.slice(0, 70),
    description: [product.description || '', facts.length ? `\n\nProduct details\n${facts.join('\n')}` : ''].join('').trim(),
    keywords: product.tags?.slice(0, 20) || [],
    attributes: product.facts || {},
    price: product.price,
    currency: product.currency,
    inventoryQuantity: product.inventoryQuantity,
    images: product.images,
    status: 'draft',
    sourceProductId: product.id,
  }
}

export function createWooCommerceAdapter(resolveConnection: WooConnectionResolver): CommercePlatformAdapter {
  return {
    id: 'woocommerce',
    label: 'WooCommerce',
    async getConnectionStatus(userId): Promise<PlatformConnectionStatus> {
      const connection = await resolveConnection(userId)
      return connection ? { connected: true, accountLabel: connection.label || connection.storeUrl } : { connected: false }
    },
    validateProduct: validation,
    transformProduct: transform,
    async publish(userId, listing) {
      const connection = await resolveConnection(userId)
      if (!connection) return { ok: false, platform: 'woocommerce', error: 'WooCommerce is not connected.' }
      try {
        const product = await createWooProduct(connection.storeUrl, connection.credentials, {
          name: listing.title,
          description: listing.description,
          shortDescription: listing.description.slice(0, 500),
          regularPrice: listing.price == null ? undefined : String(listing.price),
          stockQuantity: listing.inventoryQuantity,
          manageStock: listing.inventoryQuantity != null,
          tags: listing.keywords?.map((name) => ({ name })),
          images: listing.images?.map((image) => ({ src: image.url, alt: image.alt })),
          status: 'draft',
        })
        return { ok: true, platform: 'woocommerce', externalId: String(product.id), externalUrl: product.permalink ? String(product.permalink) : undefined }
      } catch (error: any) {
        return { ok: false, platform: 'woocommerce', error: error.message || 'WooCommerce publish failed' }
      }
    },
  }
}
