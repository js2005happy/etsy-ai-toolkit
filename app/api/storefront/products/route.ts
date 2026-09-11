import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { data: storefront } = await auth.db.from('storefronts').select('id').eq('user_id', auth.userId).maybeSingle()
  if (!storefront) return NextResponse.json({ storefront_id: null, selected: [] })

  const { data, error } = await auth.db
    .from('storefront_products')
    .select('product_id,sort_order,is_visible')
    .eq('storefront_id', storefront.id)
    .eq('user_id', auth.userId)
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: 'Unable to load storefront products' }, { status: 500 })
  return NextResponse.json({ storefront_id: storefront.id, selected: data ?? [] })
}

export async function PUT(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const productIds = Array.isArray(body.product_ids)
    ? Array.from(new Set<string>(body.product_ids.map(String))).slice(0, 200)
    : []

  const { data: storefront } = await auth.db.from('storefronts').select('id').eq('user_id', auth.userId).maybeSingle()
  if (!storefront) return NextResponse.json({ error: 'Create storefront settings first.' }, { status: 400 })

  if (productIds.length) {
    const { data: owned, error: ownedError } = await auth.db
      .from('products')
      .select('id')
      .eq('user_id', auth.userId)
      .in('id', productIds)
    if (ownedError) return NextResponse.json({ error: 'Unable to validate products' }, { status: 500 })
    const ownedIds = new Set((owned ?? []).map((row: any) => String(row.id)))
    if (productIds.some((id) => !ownedIds.has(id))) return NextResponse.json({ error: 'One or more products are not owned by this account.' }, { status: 403 })
  }

  const { error: deleteError } = await auth.db
    .from('storefront_products')
    .delete()
    .eq('storefront_id', storefront.id)
    .eq('user_id', auth.userId)
  if (deleteError) return NextResponse.json({ error: 'Unable to update storefront products' }, { status: 500 })

  if (productIds.length) {
    const rows = productIds.map((productId, index) => ({
      storefront_id: storefront.id,
      product_id: productId,
      user_id: auth.userId,
      sort_order: index,
      is_visible: true,
    }))
    const { error } = await auth.db.from('storefront_products').insert(rows)
    if (error) return NextResponse.json({ error: 'Unable to save storefront products' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, product_ids: productIds })
}
