import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scoreListing } from '@/lib/listing-health'

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = Number(params.id)
  if (!Number.isSafeInteger(id)) return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 })

  const { data: listing, error } = await supabase
    .from('etsy_listings')
    .select('id, connection_id, etsy_listing_id, title, description, tags, images, attributes, state, taxonomy_id, price, quantity, listing_url, synced_at, source_updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Unable to load listing.' }, { status: 500 })
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  return NextResponse.json({
    listing: {
      ...listing,
      tags: Array.isArray(listing.tags) ? listing.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      images: Array.isArray(listing.images) ? listing.images : [],
      attributes: Array.isArray(listing.attributes) ? listing.attributes : [],
      health: scoreListing(listing),
    },
  })
}
