import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createListing, refreshAccessToken } from '@/lib/etsy'
import { etsyUserMessage } from '@/lib/etsy-errors'

export const dynamic = 'force-dynamic'

// POST /api/etsy/push — creates an Etsy *draft*. Publishing is deliberately a
// separate reviewed action; this endpoint never changes an active listing.
export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { connection_id, title, description, price, images, taxonomy_id, tags } = body ?? {}
  if (!connection_id || !title || !description || !taxonomy_id || !Number.isFinite(Number(price)) || Number(price) <= 0) {
    return NextResponse.json({ error: 'A title, description, positive price, and confirmed Etsy category are required to create a draft.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: conn } = await service
    .from('etsy_connections')
    .select('shop_id, access_token, refresh_token, token_expires_at')
    .eq('id', connection_id)
    .eq('user_id', user.id)
    .single()

  if (!conn) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  try {
    let accessToken = conn.access_token
    const expired = new Date(conn.token_expires_at).getTime() < Date.now() + 60_000
    if (expired && conn.refresh_token) {
      const refreshed = await refreshAccessToken(conn.refresh_token)
      accessToken = refreshed.accessToken
      await service
        .from('etsy_connections')
        .update({
          access_token: refreshed.accessToken,
          refresh_token: refreshed.refreshToken,
          token_expires_at: new Date(refreshed.expiresAt).toISOString(),
        })
        .eq('id', connection_id)
    }

    const listing = await createListing(conn.shop_id, accessToken, {
      title,
      description,
      price: typeof price === 'number' ? price : Number(price) || 0,
      taxonomyId: typeof taxonomy_id === 'number' ? taxonomy_id : undefined,
      images: Array.isArray(images) ? images : undefined,
      tags: Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
    })
    return NextResponse.json({ listing })
  } catch (error: any) {
    console.error('Etsy push error:', error)
    const mapped = etsyUserMessage(error)
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }
}
