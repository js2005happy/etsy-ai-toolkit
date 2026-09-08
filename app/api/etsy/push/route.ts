import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createListing, refreshAccessToken, uploadListingImage } from '@/lib/etsy'
import { etsyUserMessage } from '@/lib/etsy-errors'

export const dynamic = 'force-dynamic'

const MAX_TITLE = 140
const MAX_DESCRIPTION = 50_000
const MAX_IMAGES = 10
const MAX_TAGS = 13

// POST /api/etsy/push — creates an Etsy draft and attempts image uploads. This
// endpoint never activates/publishes a listing; users review the draft first.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const connectionId = typeof body.connection_id === 'string' ? body.connection_id : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const price = Number(body.price)
  const taxonomyId = Number(body.taxonomy_id)
  const quantity = body.quantity == null ? 1 : Number(body.quantity)
  const images = Array.isArray(body.images) ? body.images.filter((item): item is string => typeof item === 'string') : []
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean)
    : []

  if (!connectionId || !title || !description) {
    return NextResponse.json({ error: 'A connection, title, and description are required to create an Etsy draft.' }, { status: 400 })
  }
  if (title.length > MAX_TITLE) {
    return NextResponse.json({ error: `Title is too long (max ${MAX_TITLE} characters).` }, { status: 400 })
  }
  if (description.length > MAX_DESCRIPTION) {
    return NextResponse.json({ error: 'Description is too long.' }, { status: 400 })
  }
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: 'A positive price is required.' }, { status: 400 })
  }
  if (!Number.isSafeInteger(taxonomyId) || taxonomyId <= 0) {
    return NextResponse.json({ error: 'Choose and confirm an Etsy category before creating the draft.' }, { status: 400 })
  }
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) {
    return NextResponse.json({ error: 'Quantity must be between 1 and 999.' }, { status: 400 })
  }
  if (images.length > MAX_IMAGES) {
    return NextResponse.json({ error: `Too many images (max ${MAX_IMAGES}).` }, { status: 400 })
  }
  if (tags.length > MAX_TAGS) {
    return NextResponse.json({ error: `Too many tags (max ${MAX_TAGS}).` }, { status: 400 })
  }
  if (images.some((url) => url.length > 4096)) {
    return NextResponse.json({ error: 'One or more image URLs are too long.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: conn } = await service
    .from('etsy_connections')
    .select('shop_id, access_token, refresh_token, token_expires_at')
    .eq('id', connectionId)
    .eq('user_id', user.id)
    .single()

  if (!conn) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

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
        .eq('id', connectionId)
        .eq('user_id', user.id)
    }

    const listing = await createListing(conn.shop_id, accessToken, {
      title,
      description,
      price,
      quantity,
      taxonomyId,
      tags,
    })
    const listingId = Number(listing.listing_id)
    if (!Number.isSafeInteger(listingId) || listingId <= 0) {
      console.error('Etsy draft response missing listing_id', { listing })
      return NextResponse.json({ error: 'Etsy created a draft but returned an invalid listing id. Please check your Etsy drafts.' }, { status: 502 })
    }

    let uploaded = 0
    const warnings: string[] = []
    for (let index = 0; index < images.length; index += 1) {
      const source = images[index]
      try {
        await uploadListingImage(conn.shop_id, listingId, accessToken, source, index + 1)
        uploaded += 1
      } catch (error) {
        console.error('Etsy draft image upload failed', { listingId, imageIndex: index, error })
        warnings.push(`Image ${index + 1} could not be uploaded. Review the draft before publishing.`)
      }
    }

    const failed = images.length - uploaded
    return NextResponse.json({
      listingCreated: true,
      listingId,
      listingState: typeof listing.state === 'string' ? listing.state : 'draft',
      listing,
      images: {
        attempted: images.length,
        uploaded,
        failed,
      },
      warnings,
      needsReview: true,
      message: failed > 0
        ? 'Etsy draft created with image upload warnings. Review it before publishing.'
        : 'Etsy draft created. Review it before publishing.',
    })
  } catch (error) {
    console.error('Etsy push error:', error)
    const mapped = etsyUserMessage(error)
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }
}
