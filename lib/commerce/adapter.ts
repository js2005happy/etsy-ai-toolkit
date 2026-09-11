import type {
  CanonicalProduct,
  CommercePlatformId,
  InventoryUpdate,
  PlatformListing,
  PriceUpdate,
  PublishResult,
} from '@/lib/commerce/types'

export type PlatformConnectionStatus = {
  connected: boolean
  accountLabel?: string
  scopes?: string[]
  expiresAt?: string
  error?: string
}

export type ValidationIssue = {
  field: string
  severity: 'error' | 'warning'
  message: string
}

export interface CommercePlatformAdapter {
  id: CommercePlatformId
  label: string

  getConnectionStatus(userId: string): Promise<PlatformConnectionStatus>
  validateProduct(product: CanonicalProduct): Promise<ValidationIssue[]> | ValidationIssue[]
  transformProduct(product: CanonicalProduct): Promise<PlatformListing> | PlatformListing
  publish(userId: string, listing: PlatformListing): Promise<PublishResult>
  update?(userId: string, listing: PlatformListing): Promise<PublishResult>
  syncInventory?(userId: string, updates: InventoryUpdate[]): Promise<void>
  syncPrices?(userId: string, updates: PriceUpdate[]): Promise<void>
}

const adapterRegistry = new Map<CommercePlatformId, CommercePlatformAdapter>()

export function registerCommerceAdapter(adapter: CommercePlatformAdapter): void {
  adapterRegistry.set(adapter.id, adapter)
}

export function getCommerceAdapter(id: CommercePlatformId): CommercePlatformAdapter | undefined {
  return adapterRegistry.get(id)
}

export function listRegisteredCommerceAdapters(): CommercePlatformAdapter[] {
  return Array.from(adapterRegistry.values())
}
