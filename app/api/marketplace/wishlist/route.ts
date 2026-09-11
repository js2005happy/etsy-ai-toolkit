import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

async function loadPublicTarget(storefrontId: string, productId: string) {
  const service = createServiceClient()
  const { data: storefront } = await service
    .from('storefronts')
    .select('id,user_id,is_published')
    .eq('id', storefrontId)
    .eq('is_published', true)
    .maybeSingle()
  if (!storefront) return null

  const { data: product } = await service
    .from('products')
    .select('id,user_id,status')
    .eq('id', productId)
    .eq('user_id', storefront.user_id)
    .eq('status', 'ready')
    .maybeSingle()
  if (!product) return null

  const { data: membership } = await service
    .from('storefront_products')
    .select('product_id')
    .eq('storefront_id', storefrontId)
    .eq('product_id', productId)
    .eq('is_visible', true)
    .maybeSingle()

  return membership ? { storefront, product } : null
}

export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const url = new URL(request.url)
  const productId = String(url.searchParams.get('product_id') || '').trim()
  const service = createServiceClient()

  if (productId) {
    const { data, error } = await service
      .from('marketplace_wishlist_items')
      .select('id')
      .eq('user_id', auth.userId)
      .eq('product_id', productId)
      .maybeSingle()
    if (error) return NextResponse.json({ error: 'Unable to load wishlist status.' }, { status: 500 })
    return NextResponse.json({ saved: Boolean(data) })
  }

  const { data, error } = await service
    .from('marketplace_wishlist_items')
    .select('id,storefront_id,product_id,created_at')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return NextResponse.json({ error: 'Unable to load wishlist.' }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await request.json().catch(() => ({}))
  const storefrontId = String(body.storefront_id || '').trim()
  const productId = String(body.product_id || '').trim()
  if (!storefrontId || !productId) return NextResponse.json({ error: 'Storefront and product are required.' }, { status: 400 })

  const target = await loadPublicTarget(storefrontId, productId)
  if (!target) return NextResponse.json({ error: 'This product is not available in the public marketplace catalog.' }, { status: 404 })

  const service = createServiceClient()
  const { error } = await service.from('marketplace_wishlist_items').upsert({
    user_id: auth.userId,
    storefront_id: storefrontId,
    product_id: productId,
  }, { onConflict: 'user_id,product_id' })
  if (error) return NextResponse.json({ error: 'Unable to save this product.' }, { status: 500 })
  return NextResponse.json({ saved: true })
}

export async function DELETE(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await request.json().catch(() => ({}))
  const productId = String(body.product_id || '').trim()
  if (!productId) return NextResponse.json({ error: 'Product is required.' }, { status: 400 })
  const service = createServiceClient()
  const { error } = await service
    .from('marketplace_wishlist_items')
    .delete()
    .eq('user_id', auth.userId)
    .eq('product_id', productId)
  if (error) return NextResponse.json({ error: 'Unable to remove this product.' }, { status: 500 })
  return NextResponse.json({ saved: false })
}
