import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { refreshAccessToken } from '@/lib/etsy'
import { updateEtsyDraftReview } from '@/lib/etsy-draft'
import { etsyUserMessage } from '@/lib/etsy-errors'

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = Number(params.id)
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  const tags = Array.isArray(body?.tags)
    ? body.tags
        .filter((tag: unknown): tag is string => typeof tag === 'string')
        .map((tag: string) => tag.trim())
        .filter(Boolean)
        .slice(0, 13)
    : []

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 })
  }
  if (title.length > 140) {
    return NextResponse.json({ error: 'Etsy titles must be 140 characters or fewer.' }, { status: 400 })
  }
  if (description.length > 50_000) {
    return NextResponse.json({ error: 'Description is too long.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: current } = await service
    .from('etsy_listings')
    .select('id, connection_id, etsy_listing_id, title, description, tags, images, attributes, variations, price, quantity, taxonomy_id, state')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!current) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (!current.connection_id || !current.etsy_listing_id) {
    return NextResponse.json({ error: 'This listing is not linked to an Etsy draft.' }, { status: 409 })
  }
  if (current.state !== 'draft') {
    return NextResponse.json({ error: 'Only Etsy drafts can be reviewed before publishing.' }, { status: 409 })
  }

  const { data: connection } = await service
    .from('etsy_connections')
    .select('id, shop_id, access_token, refresh_token, token_expires_at')
    .eq('id', current.connection_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!connection) return NextResponse.json({ error: 'Etsy connection not found.' }, { status: 404 })

  try {
    let accessToken = connection.access_token
    if (new Date(connection.token_expires_at).getTime() < Date.now() + 60_000 && connection.refresh_token) {
      const refreshed = await refreshAccessToken(connection.refresh_token)
      accessToken = refreshed.accessToken
      await service
        .from('etsy_connections')
        .update({
          access_token: refreshed.accessToken,
          refresh_token: refreshed.refreshToken,
          token_expires_at: new Date(refreshed.expiresAt).toISOString(),
        })
        .eq('id', connection.id)
        .eq('user_id', user.id)
    }

    await service.from('etsy_listing_versions').insert({
      listing_id: id,
      user_id: user.id,
      source: 'manual',
      snapshot: current,
    })

    const remote = await updateEtsyDraftReview(
      connection.shop_id,
      Number(current.etsy_listing_id),
      accessToken,
      { title, description, tags }
    )

    const { data: listing, error } = await service
      .from('etsy_listings')
      .update({
        title,
        description,
        tags,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, title, description, tags, synced_at')
      .single()

    if (error) {
      console.error('Local Etsy review update failed after remote sync', { listingId: id, error })
      return NextResponse.json({
        error: 'The Etsy draft was updated, but Craftly could not refresh its local copy. Sync the shop before publishing.',
        remoteUpdated: true,
      }, { status: 500 })
    }

    return NextResponse.json({
      listing,
      remoteUpdated: true,
      remoteState: typeof remote.state === 'string' ? remote.state : 'draft',
      message: 'Reviewed changes were saved to the Etsy draft. Nothing has been published yet.',
    })
  } catch (error) {
    console.error('Etsy review sync error:', error)
    const mapped = etsyUserMessage(error)
    return NextResponse.json({ error: mapped.message, remoteUpdated: false }, { status: mapped.status })
  }
}
