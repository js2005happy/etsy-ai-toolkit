import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: Request,
  props: { params: Promise<{ id: string; versionId: string }> }
) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const listingId = Number(params.id)
  const versionId = Number(params.versionId)
  if (!Number.isSafeInteger(listingId) || !Number.isSafeInteger(versionId)) return NextResponse.json({ error: 'Invalid version' }, { status: 400 })
  const { data: listing } = await supabase.from('etsy_listings').select('id, title, description, tags, images, attributes, variations, price, quantity, taxonomy_id, state').eq('id', listingId).eq('user_id', user.id).maybeSingle()
  const { data: version } = await supabase.from('etsy_listing_versions').select('snapshot').eq('id', versionId).eq('listing_id', listingId).eq('user_id', user.id).maybeSingle()
  if (!listing || !version) return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  const snapshot = version.snapshot as Record<string, unknown>
  await supabase.from('etsy_listing_versions').insert({ listing_id: listingId, user_id: user.id, source: 'restore', snapshot: listing })
  const allowed = { title: snapshot.title, description: snapshot.description, tags: snapshot.tags, images: snapshot.images, attributes: snapshot.attributes, variations: snapshot.variations, price: snapshot.price, quantity: snapshot.quantity, taxonomy_id: snapshot.taxonomy_id, state: snapshot.state, updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('etsy_listings').update(allowed).eq('id', listingId).eq('user_id', user.id).select('id').single()
  if (error) return NextResponse.json({ error: 'Unable to restore version.' }, { status: 500 })
  return NextResponse.json({ listing: data })
}
