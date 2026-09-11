import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { resolveShopifyConnection, resolveWooCommerceConnection } from '@/lib/commerce/connections'
import { updateWooProductPrice, updateWooProductStock } from '@/lib/woocommerce'
import { updateShopifyProductPrice, updateShopifyProductStock } from '@/lib/shopify'

type SyncType = 'inventory' | 'price'

function validSyncType(value: unknown): value is SyncType {
  return value === 'inventory' || value === 'price'
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const listingId = String(body.platform_listing_id || '').trim()
  const syncType = body.sync_type
  const confirm = body.confirm === true

  if (!listingId || !validSyncType(syncType)) {
    return NextResponse.json({ error: 'platform_listing_id and a valid sync_type are required.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: listing, error } = await service
    .from('platform_listings')
    .select('id,user_id,product_id,platform,external_id,title,price,currency,inventory_quantity,status,sync_status,last_synced_at')
    .eq('id', listingId)
    .eq('user_id', auth.userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Unable to load channel listing.' }, { status: 500 })
  if (!listing) return NextResponse.json({ error: 'Channel listing not found.' }, { status: 404 })
  if (!listing.external_id) return NextResponse.json({ error: 'Publish this channel listing before syncing it.' }, { status: 409 })

  const inventoryQuantity = syncType === 'inventory' ? Number(body.inventory_quantity) : null
  const price = syncType === 'price' ? Number(body.price) : null
  const currency = syncType === 'price' ? String(body.currency || listing.currency || 'USD').toUpperCase() : null

  if (syncType === 'inventory' && (!Number.isInteger(inventoryQuantity) || inventoryQuantity == null || inventoryQuantity < 0)) {
    return NextResponse.json({ error: 'Inventory must be a non-negative integer.' }, { status: 400 })
  }
  if (syncType === 'price' && (price == null || !Number.isFinite(price) || price < 0)) {
    return NextResponse.json({ error: 'Price must be a non-negative number.' }, { status: 400 })
  }

  const requestedValue = syncType === 'inventory'
    ? { inventory_quantity: inventoryQuantity as number }
    : { price: price as number, currency: currency as string }

  const supportedNow = listing.platform === 'woocommerce' || listing.platform === 'shopify'
  const preview = {
    platform: listing.platform,
    listing_id: listing.id,
    external_id: listing.external_id,
    sync_type: syncType,
    previous_value: syncType === 'inventory'
      ? { inventory_quantity: listing.inventory_quantity }
      : { price: listing.price, currency: listing.currency },
    requested_value: requestedValue,
    supported_now: supportedNow,
  }

  if (!confirm) return NextResponse.json({ preview, requires_confirmation: true })

  const { data: event, error: eventError } = await service.from('commerce_sync_events').insert({
    user_id: auth.userId,
    product_id: listing.product_id,
    platform_listing_id: listing.id,
    platform: listing.platform,
    sync_type: syncType,
    requested_value: requestedValue,
    previous_value: preview.previous_value,
    status: 'pending',
  }).select('id').single()

  if (eventError || !event) return NextResponse.json({ error: 'Unable to create sync audit event.' }, { status: 500 })

  if (!supportedNow) {
    await service.from('commerce_sync_events').update({
      status: 'skipped',
      error: `${listing.platform} external ${syncType} sync is not enabled yet. No external change was made.`,
      completed_at: new Date().toISOString(),
    }).eq('id', event.id).eq('user_id', auth.userId)
    return NextResponse.json({ error: `${listing.platform} external ${syncType} sync is not enabled yet.`, event_id: event.id }, { status: 409 })
  }

  try {
    const nextInventory = inventoryQuantity as number
    const nextPrice = price as number
    const nextCurrency = currency as string

    if (listing.platform === 'woocommerce') {
      const connection = await resolveWooCommerceConnection(auth.userId)
      if (!connection) throw new Error('WooCommerce is not connected.')
      const externalId = Number(listing.external_id)
      if (!Number.isInteger(externalId) || externalId <= 0) throw new Error('Invalid WooCommerce external product id.')
      if (syncType === 'inventory') await updateWooProductStock(connection.storeUrl, connection.credentials, externalId, nextInventory)
      else await updateWooProductPrice(connection.storeUrl, connection.credentials, externalId, nextPrice)
    } else {
      const connection = await resolveShopifyConnection(auth.userId)
      if (!connection) throw new Error('Shopify is not connected.')
      const requiredScope = syncType === 'inventory' ? 'write_inventory' : 'write_products'
      if (!connection.scopes?.includes(requiredScope)) throw new Error(`Reconnect Shopify to grant ${requiredScope} before syncing.`)
      if (syncType === 'inventory') await updateShopifyProductStock(connection.shopDomain, connection.accessToken, String(listing.external_id), nextInventory)
      else await updateShopifyProductPrice(connection.shopDomain, connection.accessToken, String(listing.external_id), nextPrice)
    }

    const now = new Date().toISOString()
    const listingUpdate = syncType === 'inventory'
      ? { inventory_quantity: nextInventory, sync_status: 'synced', last_error: null, last_synced_at: now, updated_at: now }
      : { price: nextPrice, currency: nextCurrency, sync_status: 'synced', last_error: null, last_synced_at: now, updated_at: now }
    await service.from('platform_listings').update(listingUpdate).eq('id', listing.id).eq('user_id', auth.userId)
    await service.from('commerce_sync_events').update({ status: 'success', external_reference: String(listing.external_id), completed_at: now }).eq('id', event.id).eq('user_id', auth.userId)
    return NextResponse.json({ ok: true, event_id: event.id, completed_at: now })
  } catch (err: any) {
    const message = err?.message || 'External synchronization failed.'
    await service.from('commerce_sync_events').update({ status: 'error', error: message, completed_at: new Date().toISOString() }).eq('id', event.id).eq('user_id', auth.userId)
    await service.from('platform_listings').update({ sync_status: 'error', last_error: message, updated_at: new Date().toISOString() }).eq('id', listing.id).eq('user_id', auth.userId)
    return NextResponse.json({ error: message, event_id: event.id }, { status: 400 })
  }
}
