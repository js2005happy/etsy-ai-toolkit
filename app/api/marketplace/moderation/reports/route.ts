import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

function moderatorIds() {
  return new Set(String(process.env.MARKETPLACE_MODERATOR_USER_IDS || '').split(',').map((value) => value.trim()).filter(Boolean))
}

async function requireModerator(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return { response: NextResponse.json({ error: auth.error }, { status: auth.status }) }
  if (!moderatorIds().has(auth.userId)) return { response: NextResponse.json({ error: 'Moderator access required.' }, { status: 403 }) }
  return { userId: auth.userId }
}

export async function GET(request: Request) {
  const gate = await requireModerator(request)
  if ('response' in gate) return gate.response
  const url = new URL(request.url)
  const status = String(url.searchParams.get('status') || 'open').trim()
  if (!['open', 'reviewing', 'resolved', 'dismissed', 'all'].includes(status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })

  const service = createServiceClient()
  let query = service
    .from('marketplace_reports')
    .select('id,reporter_user_id,storefront_id,product_id,reason,details,status,created_at,updated_at,reviewer_user_id,reviewed_at,resolution_note')
    .order('created_at', { ascending: true })
    .limit(200)
  if (status !== 'all') query = query.eq('status', status)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Unable to load moderation queue.' }, { status: 500 })
  return NextResponse.json({ reports: data ?? [] })
}

export async function PATCH(request: Request) {
  const gate = await requireModerator(request)
  if ('response' in gate) return gate.response
  const body = await request.json().catch(() => ({}))
  const id = String(body.id || '').trim()
  const status = String(body.status || '').trim()
  const resolutionNote = String(body.resolution_note || '').trim().slice(0, 2000)
  if (!id || !['reviewing', 'resolved', 'dismissed'].includes(status)) return NextResponse.json({ error: 'Report id and valid review status are required.' }, { status: 400 })

  const service = createServiceClient()
  const { data, error } = await service
    .from('marketplace_reports')
    .update({ status, reviewer_user_id: gate.userId, reviewed_at: new Date().toISOString(), resolution_note: resolutionNote || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id,status,reviewer_user_id,reviewed_at,resolution_note')
    .maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to update report.' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
  return NextResponse.json({ report: data })
}
