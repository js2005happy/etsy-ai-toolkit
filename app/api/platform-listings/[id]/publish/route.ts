import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { createShopifyCommerceAdapter } from '@/lib/commerce/platforms/shopify'
import { createWooCommerceAdapter } from '@/lib/commerce/platforms/woocommerce'
import { createEbayCommerceAdapter } from '@/lib/commerce/platforms/ebay'
import { resolveShopifyConnection, resolveWooCommerceConnection, resolveEbayConnection } from '@/lib/commerce/connections'
import type { CommercePlatformId, PlatformListing } from '@/lib/commerce/types'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const service = createServiceClient()

  const { data: row, error } = await service
    .from('platform_listings')
    .select('*')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to load channel draft' }, { status: 500 })
  if (!row) return NextResponse.json({ error: 'Channel draft not found' }, { status: 404 })
  if (row.external_id) {
    return NextResponse.json({ error: 'This channel draft is already linked to an external listing. Use supported sync controls instead of creating a duplicate.' }, { status: 409 })
  }

  const platform = row.platform as CommercePlatformId
  const adapter = platform === 'shopify'
    ? createShopifyCommerceAdapter(resolveShopifyConnection)
    : platform === 'woocommerce'
      ? createWooCommerceAdapter(resolveWooCommerceConnection)
      : platform === 'ebay'
        ? createEbayCommerceAdapter(resolveEbayConnection)
        : null

  if (!adapter) {
    return NextResponse.json({ error: `${platform} direct publishing is not enabled yet. Keep this as a reviewed local draft.` }, { status: 409 })
  }

  const listing: PlatformListing = {
    platform,
    title: row.title,
    description: row.description || '',
    bullets: Array.isArray(row.bullets) ? row.bullets : [],
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    attributes: row.attributes || {},
    price: row.price == null ? undefined : Number(row.price),
    currency: row.currency || undefined,
    inventoryQuantity: row.inventory_quantity == null ? undefined : Number(row.inventory_quantity),
    images: Array.isArray(row.images) ? row.images : [],
    status: row.status,
    sourceProductId: row.product_id,
    lastSyncedAt: row.last_synced_at || undefined,
  }

  await service.from('platform_listings').update({ sync_status: 'pending', last_error: null, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', auth.userId)
  const result = await adapter.publish(auth.userId, listing)

  if (!result.ok) {
    await service.from('platform_listings').update({ sync_status: 'error', last_error: result.error || 'Publish failed', updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', auth.userId)
    return NextResponse.json({ error: result.error || 'Publish failed' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const nextAttributes = result.metadata ? { ...(row.attributes || {}), ...result.metadata } : (row.attributes || {})
  await service.from('platform_listings').update({
    external_id: result.externalId,
    external_url: result.externalUrl || null,
    attributes: nextAttributes,
    status: 'active',
    sync_status: 'synced',
    last_error: null,
    last_synced_at: now,
    updated_at: now,
  }).eq('id', id).eq('user_id', auth.userId)

  return NextResponse.json({ result })
}
