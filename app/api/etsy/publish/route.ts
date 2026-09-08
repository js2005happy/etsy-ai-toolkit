import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { refreshAccessToken } from '@/lib/etsy'
import { activateListing } from '@/lib/etsy-publish'
import { etsyUserMessage } from '@/lib/etsy-errors'

export const dynamic = 'force-dynamic'

// POST /api/etsy/publish — explicit user-triggered activation of an existing
// Etsy draft. Draft creation never calls this endpoint automatically.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const connectionId = typeof body.connection_id === 'string' ? body.connection_id : String(body.connection_id || '')
  const listingId = Number(body.listing_id)
  const confirmed = body.confirm_publish === true

  if (!connectionId || !Number.isSafeInteger(listingId) || listingId <= 0) {
    return NextResponse.json({ error: 'A valid Etsy connection and listing id are required.' }, { status: 400 })
  }
  if (!confirmed) {
    return NextResponse.json({ error: 'Publishing requires explicit confirmation.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: connection } = await service
    .from('etsy_connections')
    .select('shop_id, access_token, refresh_token, token_expires_at')
    .eq('id', connectionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!connection) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

  try {
    let accessToken = connection.access_token
    const expired = new Date(connection.token_expires_at).getTime() < Date.now() + 60_000
    if (expired && connection.refresh_token) {
      const refreshed = await refreshAccessToken(connection.refresh_token)
      accessToken = refreshed.accessToken
      await service
        .from('etsy_connections')
        .update({
          access_token: refreshed.accessToken,
          refresh_token: refreshed.refreshToken,
          token_expires_at: new Date(refreshed.expiresAt).toISOString(),
        })
        .eq('id', connectionId)
        .eq('user_id', user.id)
    }

    const listing = await activateListing(connection.shop_id, listingId, accessToken)

    await service
      .from('etsy_listings')
      .update({ state: 'active', synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('connection_id', connectionId)
      .eq('etsy_listing_id', listingId)
      .eq('user_id', user.id)

    return NextResponse.json({
      published: true,
      listingId,
      state: typeof listing.state === 'string' ? listing.state : 'active',
      listing,
      message: 'Listing published to Etsy after explicit review confirmation.',
    })
  } catch (error) {
    console.error('Etsy publish error:', error)
    const mapped = etsyUserMessage(error)
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }
}
