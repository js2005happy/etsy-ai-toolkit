import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createProduct } from '@/lib/shopify'

export const dynamic = 'force-dynamic'

// POST /api/shopify/push — push a generated listing to a connected store as a
// draft product. Body: { connection_id, title, description?, tags?, price?, images? }
export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { connection_id, title, description, tags, price, images } = body ?? {}
  if (!connection_id || !title) {
    return NextResponse.json({ error: 'Missing connection_id or title' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: conn } = await service
    .from('shopify_connections')
    .select('shop_domain, access_token')
    .eq('id', connection_id)
    .eq('user_id', user.id)
    .single()

  if (!conn) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  try {
    const product = await createProduct(conn.shop_domain, conn.access_token, {
      title,
      description,
      tags: Array.isArray(tags) ? tags : undefined,
      price: price ? String(price) : undefined,
      images: Array.isArray(images) ? images : undefined,
    })
    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Shopify push error:', error)
    return NextResponse.json({ error: error.message || 'Failed to push product' }, { status: 500 })
  }
}
