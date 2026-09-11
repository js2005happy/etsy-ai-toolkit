import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

const REASONS = new Set(['misleading', 'prohibited', 'counterfeit', 'unsafe', 'spam', 'other'])

async function isPublicListing(storefrontId: string, productId: string) {
  const service = createServiceClient()
  const { data } = await service
    .from('storefront_products')
    .select('storefront_id,product_id,storefronts!inner(id,user_id,is_published),products!inner(id,user_id,status)')
    .eq('storefront_id', storefrontId)
    .eq('product_id', productId)
    .eq('is_visible', true)
    .eq('storefronts.is_published', true)
    .eq('products.status', 'ready')
    .maybeSingle()
  if (!data) return false
  const storefront = data.storefronts as any
  const product = data.products as any
  return Boolean(storefront && product && storefront.user_id === product.user_id)
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const storefrontId = String(body.storefront_id || '').trim()
  const productId = String(body.product_id || '').trim()
  const reason = String(body.reason || '').trim().toLowerCase()
  const details = String(body.details || '').trim().slice(0, 1000)

  if (!storefrontId || !productId || !REASONS.has(reason)) {
    return NextResponse.json({ error: 'Storefront, product and a valid report reason are required.' }, { status: 400 })
  }

  if (!(await isPublicListing(storefrontId, productId))) {
    return NextResponse.json({ error: 'This listing is no longer available in the public marketplace.' }, { status: 404 })
  }

  const service = createServiceClient()
  const { error } = await service.from('marketplace_reports').upsert({
    reporter_user_id: auth.userId,
    storefront_id: storefrontId,
    product_id: productId,
    reason,
    details: details || null,
    status: 'open',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'reporter_user_id,product_id,reason' })

  if (error) return NextResponse.json({ error: 'Unable to submit this report.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
