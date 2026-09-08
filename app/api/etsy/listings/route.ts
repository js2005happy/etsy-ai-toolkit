import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scoreListing } from '@/lib/listing-health'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim() ?? ''
  const state = url.searchParams.get('state')
  let requestBuilder = supabase.from('etsy_listings').select('id, etsy_listing_id, title, description, tags, images, attributes, state, price, quantity, taxonomy_id, synced_at').eq('user_id', user.id).order('synced_at', { ascending: false }).limit(100)
  if (state && state !== 'all') requestBuilder = requestBuilder.eq('state', state)
  if (query) requestBuilder = requestBuilder.ilike('title', `%${query.replace(/[%_]/g, '')}%`)
  const { data, error } = await requestBuilder
  if (error) return NextResponse.json({ error: 'Unable to load listings.' }, { status: 500 })
  const listings = (data ?? []).map((listing) => ({
    ...listing,
    tags: Array.isArray(listing.tags) ? listing.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    images: Array.isArray(listing.images) ? listing.images : [],
    health: scoreListing(listing),
  }))
  return NextResponse.json({ listings })
}
