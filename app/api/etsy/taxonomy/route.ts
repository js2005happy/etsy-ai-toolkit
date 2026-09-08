import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getSellerTaxonomy, refreshAccessToken } from '@/lib/etsy'
import { etsyUserMessage } from '@/lib/etsy-errors'

/** Returns verified Etsy taxonomy data for the current user's connected shop. */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const connectionId = new URL(request.url).searchParams.get('connection_id')
  if (!connectionId) return NextResponse.json({ error: 'connection_id is required' }, { status: 400 })
  const service = createServiceClient()
  const { data: connection } = await service.from('etsy_connections')
    .select('id, access_token, refresh_token, token_expires_at').eq('id', connectionId).eq('user_id', user.id).maybeSingle()
  if (!connection) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  try {
    let token = connection.access_token
    if (new Date(connection.token_expires_at).getTime() < Date.now() + 60_000) {
      const refreshed = await refreshAccessToken(connection.refresh_token)
      token = refreshed.accessToken
      await service.from('etsy_connections').update({ access_token: refreshed.accessToken, refresh_token: refreshed.refreshToken, token_expires_at: new Date(refreshed.expiresAt).toISOString() }).eq('id', connection.id).eq('user_id', user.id)
    }
    return NextResponse.json({ taxonomy: await getSellerTaxonomy(token) })
  } catch (error) {
    const mapped = etsyUserMessage(error)
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }
}
