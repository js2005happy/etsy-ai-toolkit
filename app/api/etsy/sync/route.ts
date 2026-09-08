import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getShopListings, refreshAccessToken } from '@/lib/etsy'
import { etsyUserMessage } from '@/lib/etsy-errors'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { connection_id, kind = 'manual' } = await request.json().catch(() => ({}))
  if (!connection_id) return NextResponse.json({ error: 'connection_id is required' }, { status: 400 })
  const service = createServiceClient()
  const { data: connection } = await service.from('etsy_connections').select('id, shop_id, access_token, refresh_token, token_expires_at').eq('id', connection_id).eq('user_id', user.id).maybeSingle()
  if (!connection) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  const { data: job } = await service.from('etsy_sync_jobs').insert({ connection_id, user_id: user.id, kind, status: 'fetching' }).select('id').single()
  try {
    let token = connection.access_token
    if (new Date(connection.token_expires_at).getTime() < Date.now() + 60_000) {
      const refreshed = await refreshAccessToken(connection.refresh_token)
      token = refreshed.accessToken
      await service.from('etsy_connections').update({ access_token: refreshed.accessToken, refresh_token: refreshed.refreshToken, token_expires_at: new Date(refreshed.expiresAt).toISOString() }).eq('id', connection.id).eq('user_id', user.id)
    }
    const { listings, count } = await getShopListings(connection.shop_id, token)
    await service.from('etsy_sync_jobs').update({ status: 'processing', total_count: count }).eq('id', job?.id).eq('user_id', user.id)
    let failed = 0
    for (const listing of listings) {
      const images = Array.isArray(listing.images) ? listing.images : []
      const { error } = await service.from('etsy_listings').upsert({
        user_id: user.id, connection_id, etsy_listing_id: listing.listing_id, title: String(listing.title ?? ''), description: String(listing.description ?? ''),
        tags: Array.isArray(listing.tags) ? listing.tags : [], price: listing.price ?? null, quantity: listing.quantity ?? null,
        taxonomy_id: listing.taxonomy_id ?? null, attributes: Array.isArray(listing.attributes) ? listing.attributes : [], variations: Array.isArray(listing.variations) ? listing.variations : [], images,
        shipping_profile_id: listing.shipping_profile_id ?? null, state: String(listing.state ?? 'draft'), listing_url: listing.url ?? null, source_updated_at: listing.updated_timestamp ? new Date(Number(listing.updated_timestamp) * 1000).toISOString() : null, synced_at: new Date().toISOString(),
      }, { onConflict: 'connection_id,etsy_listing_id' })
      if (error) failed += 1
    }
    await service.from('etsy_sync_jobs').update({ status: failed ? 'partial' : 'completed', processed_count: listings.length - failed, failed_count: failed, completed_at: new Date().toISOString() }).eq('id', job?.id).eq('user_id', user.id)
    return NextResponse.json({ job_id: job?.id, imported: listings.length - failed, failed, total: count, has_more: count > listings.length })
  } catch (error) {
    await service.from('etsy_sync_jobs').update({ status: 'failed', error_summary: error instanceof Error ? error.message : 'Unknown error', completed_at: new Date().toISOString() }).eq('id', job?.id).eq('user_id', user.id)
    const mapped = etsyUserMessage(error)
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }
}
