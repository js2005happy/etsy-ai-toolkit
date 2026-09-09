import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { refreshAccessToken } from '@/lib/etsy'

const ETSY_API_BASE = 'https://openapi.etsy.com/v3/application'

function etsyHeaders(accessToken: string): Record<string, string> {
  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey) throw new Error('Etsy API key is not configured.')
  return {
    Authorization: `Bearer ${accessToken}`,
    'x-api-key': sharedSecret ? `${apiKey}:${sharedSecret}` : apiKey,
  }
}

function normalizePrice(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (value && typeof value === 'object') {
    const money = value as { amount?: unknown; divisor?: unknown }
    const amount = Number(money.amount)
    const divisor = Number(money.divisor)
    if (Number.isFinite(amount) && Number.isFinite(divisor) && divisor > 0) return amount / divisor
  }
  return null
}

export async function POST(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const localId = Number(params.id)
  if (!Number.isSafeInteger(localId) || localId <= 0) return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: local } = await service.from('etsy_listings').select('id, connection_id, etsy_listing_id').eq('id', localId).eq('user_id', user.id).maybeSingle()
  if (!local) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  const { data: connection } = await service.from('etsy_connections').select('id, access_token, refresh_token, token_expires_at').eq('id', local.connection_id).eq('user_id', user.id).maybeSingle()
  if (!connection) return NextResponse.json({ error: 'Etsy connection not found' }, { status: 404 })

  try {
    let accessToken = connection.access_token
    const expiresSoon = new Date(connection.token_expires_at).getTime() < Date.now() + 60_000
    if (expiresSoon && connection.refresh_token) {
      const refreshed = await refreshAccessToken(connection.refresh_token)
      accessToken = refreshed.accessToken
      await service.from('etsy_connections').update({ access_token: refreshed.accessToken, refresh_token: refreshed.refreshToken, token_expires_at: new Date(refreshed.expiresAt).toISOString() }).eq('id', connection.id).eq('user_id', user.id)
    }

    const response = await fetch(`${ETSY_API_BASE}/listings/${local.etsy_listing_id}?includes=Images`, { headers: etsyHeaders(accessToken), cache: 'no-store' })
    const remote = await response.json().catch(() => ({}))
    if (!response.ok) {
      console.error('Etsy single listing refresh failed', { listingId: local.etsy_listing_id, status: response.status })
      return NextResponse.json({ error: 'Could not refresh this listing from Etsy.' }, { status: response.status >= 500 ? 502 : response.status })
    }

    const now = new Date().toISOString()
    const update: Record<string, unknown> = {
      title: typeof remote.title === 'string' ? remote.title : '',
      description: typeof remote.description === 'string' ? remote.description : '',
      tags: Array.isArray(remote.tags) ? remote.tags : [],
      images: Array.isArray(remote.images) ? remote.images : [],
      state: typeof remote.state === 'string' ? remote.state : 'draft',
      listing_url: typeof remote.url === 'string' ? remote.url : null,
      synced_at: now,
      source_updated_at: remote.updated_timestamp ? new Date(Number(remote.updated_timestamp) * 1000).toISOString() : null,
      updated_at: now,
    }

    if (Array.isArray(remote.attributes)) update.attributes = remote.attributes
    if (Number.isSafeInteger(Number(remote.taxonomy_id))) update.taxonomy_id = Number(remote.taxonomy_id)
    if (Number.isFinite(Number(remote.quantity))) update.quantity = Number(remote.quantity)
    const normalizedPrice = normalizePrice(remote.price)
    if (normalizedPrice !== null) update.price = normalizedPrice

    const { error: updateError } = await service.from('etsy_listings').update(update).eq('id', local.id).eq('user_id', user.id)
    if (updateError) {
      console.error('Failed to persist Etsy single listing refresh', updateError)
      return NextResponse.json({ error: 'Etsy refreshed, but Craftly could not save the refreshed listing.' }, { status: 500 })
    }

    return NextResponse.json({ refreshed: true, listing_id: local.id, etsy_listing_id: local.etsy_listing_id, synced_at: now })
  } catch (error) {
    console.error('Etsy single listing refresh error:', error)
    return NextResponse.json({ error: 'Could not refresh this listing from Etsy.' }, { status: 502 })
  }
}
