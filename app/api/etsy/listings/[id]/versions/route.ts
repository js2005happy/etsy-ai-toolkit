import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const listingId = Number(params.id)
  if (!Number.isSafeInteger(listingId)) return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 })
  const { data, error } = await supabase.from('etsy_listing_versions').select('id, source, snapshot, created_at').eq('listing_id', listingId).eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load version history.' }, { status: 500 })
  return NextResponse.json({ versions: data ?? [] })
}
