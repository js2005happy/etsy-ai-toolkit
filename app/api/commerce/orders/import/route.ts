import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { resolveEbayConnection, resolveShopifyConnection, resolveWooCommerceConnection } from '@/lib/commerce/connections'
import { listWooOrders } from '@/lib/woocommerce'
import { listShopifyOrders } from '@/lib/shopify'
import { listEbayOrders } from '@/lib/ebay'

function money(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function isoOrNull(value: unknown): string | null {
  const s = String(value || '').trim()
  if (!s) return null
  const d = new Date(s)
  return Number.isFinite(d.getTime()) ? d.toISOString() : null
}

async function replaceItems(service: any, userId: string, orderId: string, rows: any[]) {
  await service.from('commerce_order_items').delete().eq('order_id', orderId).eq('user_id', userId)
  if (!rows.length) return 0
  const { error } = await service.from('commerce_order_items').insert(rows.map((row) => ({ ...row, order_id: orderId, user_id: userId })))
  if (error) throw error
  return rows.length
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const platform = String(body.platform || 'woocommerce')
  if (!['woocommerce', 'shopify', 'ebay'].includes(platform)) {
    return NextResponse.json({ error: `${platform} order ingestion is not enabled yet.` }, { status: 409 })
  }

  const days = Math.min(Math.max(Number(body.days || 30), 1), 90)
  const after = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const service = createServiceClient()
  let imported = 0
  let itemCount = 0

  try {
    if (platform === 'woocommerce') {
      const connection = await resolveWooCommerceConnection(auth.userId)
      if (!connection) return NextResponse.json({ error: 'WooCommerce is not connected.' }, { status: 409 })
      const remoteOrders = await listWooOrders(connection.storeUrl, connection.credentials, { after, perPage: 100 })

      for (const order of remoteOrders) {
        const externalOrderId = String(order.id || '').trim()
        if (!externalOrderId) continue
        const billingName = [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' ').trim()
        const shippingName = [order.shipping?.first_name, order.shipping?.last_name].filter(Boolean).join(' ').trim()
        const { data: saved, error } = await service.from('commerce_orders').upsert({
          user_id: auth.userId,
          platform: 'woocommerce',
          external_order_id: externalOrderId,
          external_url: `${connection.storeUrl}/wp-admin/post.php?post=${encodeURIComponent(externalOrderId)}&action=edit`,
          status: String(order.status || 'open'),
          financial_status: order.date_paid ? 'paid' : (order.status === 'refunded' ? 'refunded' : 'pending'),
          fulfillment_status: ['completed','refunded','cancelled'].includes(String(order.status)) ? String(order.status) : 'unfulfilled',
          currency: order.currency || null,
          subtotal: money(order.total) != null ? Number(order.total) - Number(order.total_tax || 0) - Number(order.shipping_total || 0) : null,
          shipping_total: money(order.shipping_total), tax_total: money(order.total_tax), discount_total: money(order.discount_total), total: money(order.total),
          buyer_name: shippingName || billingName || null,
          buyer_email: order.billing?.email || null,
          ship_to_country: order.shipping?.country || order.billing?.country || null,
          ordered_at: isoOrNull(order.date_created_gmt || order.date_created),
          raw_summary: { number: order.number, payment_method_title: order.payment_method_title },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform,external_order_id' }).select('id').single()
        if (error || !saved) { console.error('Woo order upsert failed', { externalOrderId, error }); continue }
        const lines = Array.isArray(order.line_items) ? order.line_items : []
        itemCount += await replaceItems(service, auth.userId, saved.id, lines.map((line: any) => ({
          external_line_id: line.id == null ? null : String(line.id), sku: line.sku || null, title: String(line.name || 'Product').slice(0, 500), quantity: Math.max(Number(line.quantity) || 1, 1), unit_price: money(line.price), total: money(line.total), metadata: { product_id: line.product_id, variation_id: line.variation_id },
        })))
        imported += 1
      }
    } else if (platform === 'shopify') {
      const connection = await resolveShopifyConnection(auth.userId)
      if (!connection) return NextResponse.json({ error: 'Shopify is not connected.' }, { status: 409 })
      if (!connection.scopes?.includes('read_orders')) {
        return NextResponse.json({ error: 'Reconnect Shopify to grant the read_orders scope before importing orders.' }, { status: 409 })
      }
      const remoteOrders = await listShopifyOrders(connection.shopDomain, connection.accessToken, { createdAtMin: after, limit: 250 })

      for (const order of remoteOrders) {
        const externalOrderId = String(order.id || '').trim()
        if (!externalOrderId) continue
        const customerName = [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(' ').trim()
        const shippingName = order.shipping_address?.name || [order.shipping_address?.first_name, order.shipping_address?.last_name].filter(Boolean).join(' ').trim()
        const { data: saved, error } = await service.from('commerce_orders').upsert({
          user_id: auth.userId,
          platform: 'shopify',
          external_order_id: externalOrderId,
          external_url: `https://${connection.shopDomain}/admin/orders/${encodeURIComponent(externalOrderId)}`,
          status: order.cancelled_at ? 'cancelled' : (order.closed_at ? 'closed' : 'open'),
          financial_status: order.financial_status || null,
          fulfillment_status: order.fulfillment_status || 'unfulfilled',
          currency: order.currency || order.presentment_currency || null,
          subtotal: money(order.subtotal_price), shipping_total: money(order.total_shipping_price_set?.shop_money?.amount), tax_total: money(order.total_tax), discount_total: money(order.total_discounts), total: money(order.total_price),
          buyer_name: shippingName || customerName || null,
          buyer_email: order.email || order.contact_email || null,
          ship_to_country: order.shipping_address?.country_code || order.shipping_address?.country || null,
          ordered_at: isoOrNull(order.created_at),
          raw_summary: { name: order.name, order_number: order.order_number, source_name: order.source_name },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform,external_order_id' }).select('id').single()
        if (error || !saved) { console.error('Shopify order upsert failed', { externalOrderId, error }); continue }
        const lines = Array.isArray(order.line_items) ? order.line_items : []
        itemCount += await replaceItems(service, auth.userId, saved.id, lines.map((line: any) => ({
          external_line_id: line.id == null ? null : String(line.id), sku: line.sku || null, title: String(line.title || line.name || 'Product').slice(0, 500), quantity: Math.max(Number(line.quantity) || 1, 1), unit_price: money(line.price), total: money(line.price) == null ? null : Number(line.price) * Math.max(Number(line.quantity) || 1, 1), metadata: { product_id: line.product_id, variant_id: line.variant_id, variant_title: line.variant_title },
        })))
        imported += 1
      }
    } else {
      const connection = await resolveEbayConnection(auth.userId)
      if (!connection) return NextResponse.json({ error: 'eBay is not connected or its publishing settings are incomplete.' }, { status: 409 })
      const remoteOrders = await listEbayOrders(connection.accessToken, { createdAtMin: after, limit: 200 })

      for (const order of remoteOrders) {
        const externalOrderId = String(order.orderId || '').trim()
        if (!externalOrderId) continue
        const pricing = order.pricingSummary || {}
        const cancelState = String(order.cancelStatus?.cancelState || '')
        const cancelled = Boolean(cancelState && !['NONE_REQUESTED', 'NONE'].includes(cancelState))
        const shipTo = Array.isArray(order.fulfillmentStartInstructions)
          ? order.fulfillmentStartInstructions.find((entry: any) => entry?.shippingStep?.shipTo)?.shippingStep?.shipTo
          : null
        const { data: saved, error } = await service.from('commerce_orders').upsert({
          user_id: auth.userId,
          platform: 'ebay',
          external_order_id: externalOrderId,
          external_url: null,
          status: cancelled ? 'cancelled' : 'open',
          financial_status: String(order.orderPaymentStatus || '').toLowerCase() || null,
          fulfillment_status: String(order.orderFulfillmentStatus || '').toLowerCase() || null,
          currency: pricing.total?.currency || pricing.priceSubtotal?.currency || null,
          subtotal: money(pricing.priceSubtotal?.value),
          shipping_total: money(pricing.deliveryCost?.value),
          tax_total: money(pricing.tax?.value),
          discount_total: money(pricing.adjustment?.value),
          total: money(pricing.total?.value),
          buyer_name: order.buyer?.username || null,
          buyer_email: null,
          ship_to_country: shipTo?.countryCode || null,
          ordered_at: isoOrNull(order.creationDate),
          raw_summary: { sales_record_reference: order.salesRecordReference || null, marketplace_id: order.marketplaceId || null },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform,external_order_id' }).select('id').single()
        if (error || !saved) { console.error('eBay order upsert failed', { externalOrderId, error }); continue }
        const lines = Array.isArray(order.lineItems) ? order.lineItems : []
        itemCount += await replaceItems(service, auth.userId, saved.id, lines.map((line: any) => {
          const quantity = Math.max(Number(line.quantity) || 1, 1)
          const unitPrice = money(line.lineItemCost?.value)
          return {
            external_line_id: line.lineItemId == null ? null : String(line.lineItemId),
            sku: line.sku || null,
            title: String(line.title || 'Product').slice(0, 500),
            quantity,
            unit_price: unitPrice,
            total: unitPrice == null ? null : unitPrice * quantity,
            metadata: { legacy_item_id: line.legacyItemId || null, fulfillment_status: line.lineItemFulfillmentStatus || null },
          }
        }))
        imported += 1
      }
    }

    return NextResponse.json({ ok: true, platform, imported, items: itemCount, window_days: days })
  } catch (error: any) {
    console.error(`${platform} order import failed`, error)
    const message = String(error?.message || `${platform} order import failed.`)
    const needsReconnect = platform === 'ebay' && /scope|authorization|permission|403/i.test(message)
    return NextResponse.json({ error: needsReconnect ? 'Reconnect eBay to grant the sell.fulfillment scope before importing orders.' : message }, { status: 400 })
  }
}
