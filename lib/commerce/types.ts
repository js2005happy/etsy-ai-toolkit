import type { ProductCategory } from '@/lib/product-profiles'

export type CommercePlatformId =
  | 'etsy'
  | 'shopify'
  | 'woocommerce'
  | 'amazon'
  | 'ebay'
  | 'tiktok'
  | 'walmart'
  | 'google'

export type ProductFactValue = string | number | boolean | string[] | null | undefined

export type ProductVariant = {
  id?: string
  sku?: string
  title: string
  options: Record<string, string>
  price?: number
  compareAtPrice?: number
  currency?: string
  inventoryQuantity?: number
  barcode?: string
  weightGrams?: number
  imageUrl?: string
}

export type ProductImage = {
  url: string
  alt?: string
  width?: number
  height?: number
  role?: 'hero' | 'detail' | 'scale' | 'lifestyle' | 'variant' | 'guide' | 'other'
}

export type CanonicalProduct = {
  id?: string
  title: string
  description?: string
  category?: ProductCategory
  productType?: string
  brand?: string
  material?: string
  style?: string
  sku?: string
  price?: number
  currency?: string
  inventoryQuantity?: number
  tags?: string[]
  images?: ProductImage[]
  variants?: ProductVariant[]
  facts?: Record<string, ProductFactValue>
  shipping?: {
    weightGrams?: number
    dispatchDaysMin?: number
    dispatchDaysMax?: number
    shipsFromCountry?: string
    freeShipping?: boolean
  }
  compliance?: {
    ageRestricted?: boolean
    digitalOnly?: boolean
    handmade?: boolean
    personalized?: boolean
    warnings?: string[]
    certifications?: string[]
  }
}

export type PlatformListing = {
  platform: CommercePlatformId
  externalId?: string
  title: string
  description: string
  bullets?: string[]
  keywords?: string[]
  attributes?: Record<string, ProductFactValue>
  price?: number
  currency?: string
  inventoryQuantity?: number
  images?: ProductImage[]
  status?: 'draft' | 'active' | 'paused' | 'archived' | 'error'
  sourceProductId?: string
  lastSyncedAt?: string
}

export type PublishResult = {
  ok: boolean
  platform: CommercePlatformId
  externalId?: string
  externalUrl?: string
  warnings?: string[]
  error?: string
}

export type InventoryUpdate = {
  sku?: string
  externalId?: string
  quantity: number
}

export type PriceUpdate = {
  sku?: string
  externalId?: string
  price: number
  currency: string
}
