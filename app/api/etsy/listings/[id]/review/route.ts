import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = Number(params.id)
  if (!Number.isSafeInteger(id)) return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 })
  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string').map((tag: string) => tag.trim()).filter(Boolean).slice(0, 13) : []
  if (!title || !description) return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 })
  const { data: current } = await supabase.from('etsy_listings').select('id, title, description, tags, images, attributes, variations, price, quantity, taxonomy_id, state').eq('id', id).eq('user_id', user.id).maybeSingle()
  if (!current) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  await supabase.from('etsy_listing_versions').insert({ listing_id: id, user_id: user.id, source: 'manual', snapshot: current })
  const { data: listing, error } = await supabase.from('etsy_listings').update({ title, description, tags, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).select('id, title, description, tags').single()
  if (error) return NextResponse.json({ error: 'Unable to save reviewed changes.' }, { status: 500 })
  return NextResponse.json({ listing })
}
