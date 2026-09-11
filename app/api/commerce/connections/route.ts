import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

const PUBLIC_COLUMNS = 'id,platform,account_label,account_key,store_url,scopes,token_expires_at,status,last_error,created_at,updated_at'

export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const url = new URL(request.url)
  const platform = url.searchParams.get('platform')
  const service = createServiceClient()
  let query = service.from('commerce_connections').select(PUBLIC_COLUMNS).eq('user_id', auth.userId).order('updated_at', { ascending: false })
  if (platform) query = query.eq('platform', platform)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Unable to load commerce connections' }, { status: 500 })
  return NextResponse.json({ connections: data ?? [] })
}

export async function DELETE(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await request.json().catch(() => ({}))
  const id = String(body.id || '').trim()
  if (!id) return NextResponse.json({ error: 'Connection id is required' }, { status: 400 })
  const service = createServiceClient()
  const { error, count } = await service.from('commerce_connections').delete({ count: 'exact' }).eq('id', id).eq('user_id', auth.userId)
  if (error) return NextResponse.json({ error: 'Unable to disconnect commerce account' }, { status: 500 })
  if (!count) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
