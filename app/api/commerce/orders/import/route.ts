import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { resolveWooCommerceConnection } from '@/lib/commerce/connections'
import { listWooOrders } from '@/lib/woocommerce'

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

export async function POST(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const platform = String(body.platform || 'woocommerce')
  if (platform !== 'woocommerce') {
    return NextResponse.json({ error: `${platform} order ingestion is not enabled yet.` }, { status: 409 })
  }

  const days = Math.min(Math.max(Number(body.days || 30), 1), 90)
  const after = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const connection = await resolveWooCommerceConnection(auth.userId)
  if (!connection) return NextResponse.json({ error: 'WooCommerce is not connected.' }, { status: 409 })

  try {
    const remoteOrders = await listWooOrders(connection.storeUrl, connection.credentials, { after, perPage: 100 })
    const service = createServiceClient()
    let imported = 0
    let itemCount = 0

    for (const order of remoteOrders) {
      const externalOrderId = String(order.id || '').trim()
      if (!externalOrderId) continue
      const billingName = [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' ').trim()
      const shippingName = [order.shipping?.first_name, order.shipping?.last_name].filter(Boolean).join(' ').trim()
      const { data: saved, error } = await service.from('commerce_orders').upsert({
        user_id: auth.userId,
        platform: 'woocommerce',
        external_order_id: externalOrderId,
        external_url: order.number ? `${connection.storeUrl}/wp-admin/post.php?post=${encodeURIComponent(externalOrderId)}&action=edit` : null,
        status: String(order.status || 'open'),
        financial_status: order.date_paid ? 'paid' : (order.status === 'refunded' ? 'refunded' : 'pending'),
        fulfillment_status: ['completed','refunded','cancelled'].includes(String(order.status)) ? String(order.status) : 'unfulfilled',
        currency: order.currency || null,
        subtotal: money(order.total) != null && money(order.total_tax) != null && money(order.shipping_total) != null
          ? Number(order.total) - Number(order.total_tax || 0) - Number(order.shipping_total || 0)
          : null,
        shipping_total: money(order.shipping_total),
        tax_total: money(order.total_tax),
        discount_total: money(order.discount_total),
        total: money(order.total),
        buyer_name: shippingName || billingName || null,
        buyer_email: order.billing?.email || null,
        ship_to_country: order.shipping?.country || order.billing?.country || null,
        ordered_at: isoOrNull(order.date_created_gmt || order.date_created),
        raw_summary: {
          number: order.number,
          payment_method_title: order.payment_method_title,
          customer_note: order.customer_note,
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,platform,external_order_id' }).select('id').single()

      if (error || !saved) {
        console.error('Woo order upsert failed', { externalOrderId, error })
        continue
      }

      await service.from('commerce_order_items').delete().eq('order_id', saved.id).eq('user_id', auth.userId)
      const lines = Array.isArray(order.line_items) ? order.line_items : []
      if (lines.length) {
        const rows = lines.map((line: any) => ({
          order_id: saved.id,
          user_id: auth.userId,
          external_line_id: line.id == null ? null : String(line.id),
          sku: line.sku || null,
          title: String(line.name || 'Product').slice(0, 500),
          quantity: Math.max(Number(line.quantity) || 1, 1),
          unit_price: money(line.price),
          total: money(line.total),
          metadata: { product_id: line.product_id, variation_id: line.variation_id },
        }))
        const { error: itemError } = await service.from('commerce_order_items').insert(rows)
        if (itemError) console.error('Woo order items insert failed', { externalOrderId, itemError })
        else itemCount += rows.length
      }
      imported += 1
    }

    return NextResponse.json({ ok: true, platform: 'woocommerce', imported, items: itemCount, window_days: days })
  } catch (error: any) {
    console.error('WooCommerce order import failed', error)
    return NextResponse.json({ error: error.message || 'WooCommerce order import failed.' }, { status: 400 })
  }
}
