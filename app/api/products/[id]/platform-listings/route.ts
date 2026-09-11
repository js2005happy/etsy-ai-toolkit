import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import type { CommercePlatformId } from '@/lib/commerce/types'

const ALLOWED = new Set<CommercePlatformId>(['etsy','shopify','woocommerce','amazon','ebay','tiktok','walmart','google'])

async function resolveOwnedProduct(db: any, userId: string, id: string) {
  const { data } = await db.from('products').select('id').eq('id', id).eq('user_id', userId).maybeSingle()
  return data
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  if (!(await resolveOwnedProduct(auth.db, auth.userId, id))) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { data, error } = await auth.db
    .from('platform_listings')
    .select('*')
    .eq('product_id', id)
    .eq('user_id', auth.userId)
    .order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load channel drafts' }, { status: 500 })
  return NextResponse.json({ listings: data ?? [] })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  if (!(await resolveOwnedProduct(auth.db, auth.userId, id))) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const raw = Array.isArray(body.listings) ? body.listings : [body]
  if (!raw.length || raw.length > 8) return NextResponse.json({ error: 'Provide between 1 and 8 channel drafts.' }, { status: 400 })

  const now = new Date().toISOString()
  const rows = raw.map((item: any) => {
    const platform = String(item.platform || '') as CommercePlatformId
    if (!ALLOWED.has(platform)) throw new Error(`Unsupported platform: ${platform}`)
    const title = String(item.title || '').trim()
    if (!title) throw new Error(`Title is required for ${platform}`)
    return {
      product_id: id,
      user_id: auth.userId,
      platform,
      title: title.slice(0, 300),
      description: String(item.description || '').slice(0, 30000),
      bullets: Array.isArray(item.bullets) ? item.bullets.slice(0, 20) : [],
      keywords: Array.isArray(item.keywords) ? item.keywords.slice(0, 50) : Array.isArray(item.tags) ? item.tags.slice(0, 50) : [],
      attributes: item.attributes && typeof item.attributes === 'object' && !Array.isArray(item.attributes) ? item.attributes : {},
      price: item.price == null ? null : Number(item.price),
      currency: item.currency ? String(item.currency).slice(0, 8) : null,
      inventory_quantity: item.inventory_quantity == null ? null : Number(item.inventory_quantity),
      images: Array.isArray(item.images) ? item.images.slice(0, 30) : [],
      status: 'draft',
      sync_status: 'local',
      updated_at: now,
    }
  })

  const { data, error } = await auth.db
    .from('platform_listings')
    .upsert(rows, { onConflict: 'product_id,platform' })
    .select('*')
  if (error) {
    console.error('Save platform listings failed', error)
    return NextResponse.json({ error: 'Unable to save channel drafts' }, { status: 500 })
  }
  return NextResponse.json({ listings: data ?? [] })
}
