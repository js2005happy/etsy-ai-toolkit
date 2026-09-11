import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

const PLATFORMS = new Set(['etsy','shopify','woocommerce','amazon','ebay','tiktok','walmart','google','craftly'])

export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const url = new URL(request.url)
  const platform = url.searchParams.get('platform')
  const status = url.searchParams.get('status')
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 100)

  let query = auth.db
    .from('commerce_orders')
    .select('id,platform,external_order_id,external_url,status,financial_status,fulfillment_status,currency,subtotal,shipping_total,tax_total,discount_total,total,buyer_name,buyer_email,ship_to_country,ordered_at,created_at,updated_at,commerce_order_items(id,product_id,platform_listing_id,external_line_id,sku,title,quantity,unit_price,total,metadata)')
    .eq('user_id', auth.userId)
    .order('ordered_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (platform && PLATFORMS.has(platform)) query = query.eq('platform', platform)
  if (status) query = query.eq('status', status.slice(0, 80))

  const { data, error } = await query
  if (error) {
    console.error('Order inbox load failed', error)
    return NextResponse.json({ error: 'Unable to load orders.' }, { status: 500 })
  }

  const orders = data ?? []
  const summary = orders.reduce((acc: Record<string, number>, order: any) => {
    acc.total += 1
    acc[order.platform] = (acc[order.platform] || 0) + 1
    if (!order.fulfillment_status || order.fulfillment_status === 'unfulfilled') acc.needs_fulfillment += 1
    return acc
  }, { total: 0, needs_fulfillment: 0 })

  return NextResponse.json({ orders, summary })
}
