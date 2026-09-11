import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { getEbayPublishingSettings, updateEbayPublishingSettings } from '@/lib/commerce/connections'

const MARKETPLACE_RE = /^EBAY_[A-Z]{2,3}$/

export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const url = new URL(request.url)
  const connectionId = String(url.searchParams.get('connection_id') || '').trim()
  if (!connectionId) return NextResponse.json({ error: 'Connection id is required.' }, { status: 400 })
  try {
    const settings = await getEbayPublishingSettings(auth.userId, connectionId)
    if (!settings) return NextResponse.json({ error: 'eBay connection not found.' }, { status: 404 })
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Unable to load eBay publishing settings', error)
    return NextResponse.json({ error: 'Unable to load eBay publishing settings.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await request.json().catch(() => ({}))
  const connectionId = String(body.connection_id || '').trim()
  const marketplaceId = String(body.marketplace_id || '').trim().toUpperCase()
  const merchantLocationKey = String(body.merchant_location_key || '').trim()
  const fulfillmentPolicyId = String(body.fulfillment_policy_id || '').trim()
  const paymentPolicyId = String(body.payment_policy_id || '').trim()
  const returnPolicyId = String(body.return_policy_id || '').trim()
  const categoryId = String(body.category_id || '').trim()

  if (!connectionId || !MARKETPLACE_RE.test(marketplaceId) || !merchantLocationKey || !fulfillmentPolicyId || !paymentPolicyId || !returnPolicyId) {
    return NextResponse.json({ error: 'Connection, marketplace, merchant location, fulfillment, payment and return policy are required.' }, { status: 400 })
  }

  try {
    await updateEbayPublishingSettings(auth.userId, connectionId, {
      marketplaceId,
      merchantLocationKey: merchantLocationKey.slice(0, 100),
      fulfillmentPolicyId: fulfillmentPolicyId.slice(0, 100),
      paymentPolicyId: paymentPolicyId.slice(0, 100),
      returnPolicyId: returnPolicyId.slice(0, 100),
      categoryId: categoryId ? categoryId.slice(0, 50) : undefined,
    })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to save eBay publishing settings.' }, { status: 400 })
  }
}
