import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: connections, error } = await supabase.from('etsy_connections').select('id, shop_id, shop_name, updated_at').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load Etsy shop.' }, { status: 500 })
  const connection = connections?.[0]
  if (!connection) return NextResponse.json({ connected: false })
  const { data: listings } = await supabase.from('etsy_listings').select('id, state, title, description, tags, images, attributes, synced_at').eq('connection_id', connection.id).eq('user_id', user.id)
  const total = listings?.length ?? 0
  const active = listings?.filter((listing) => listing.state === 'active').length ?? 0
  const drafts = listings?.filter((listing) => listing.state === 'draft').length ?? 0
  return NextResponse.json({ connected: true, connection, totals: { total, active, drafts }, last_synced_at: listings?.reduce<string | null>((latest, listing) => !latest || listing.synced_at > latest ? listing.synced_at : latest, null) ?? null })
}
