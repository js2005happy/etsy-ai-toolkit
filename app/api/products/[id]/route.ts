import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

const MUTABLE = new Set([
  'title','description','category','product_type','brand','material','style','sku','price','currency','inventory_quantity','tags','images','facts','shipping','compliance','status',
])

async function idFrom(params: Promise<{ id: string }>) {
  const { id } = await params
  return id
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const id = await idFrom(params)
  const { data, error } = await auth.db
    .from('products')
    .select('*, product_variants(*), platform_listings(*)')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to load product' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json({ product: data })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const id = await idFrom(params)
  const body = await request.json().catch(() => ({}))
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const [key, value] of Object.entries(body)) {
    if (MUTABLE.has(key)) update[key] = value
  }
  if ('title' in update && !String(update.title || '').trim()) return NextResponse.json({ error: 'Product title cannot be empty' }, { status: 400 })
  if ('price' in update && update.price != null && Number(update.price) < 0) return NextResponse.json({ error: 'Price cannot be negative' }, { status: 400 })
  if ('inventory_quantity' in update && update.inventory_quantity != null) {
    const n = Number(update.inventory_quantity)
    if (!Number.isInteger(n) || n < 0) return NextResponse.json({ error: 'Inventory must be a non-negative integer' }, { status: 400 })
  }

  const { data, error } = await auth.db
    .from('products')
    .update(update)
    .eq('id', id)
    .eq('user_id', auth.userId)
    .select('*')
    .maybeSingle()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That SKU is already used by another product.' }, { status: 409 })
    return NextResponse.json({ error: 'Unable to update product' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json({ product: data })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const id = await idFrom(params)
  const { error, count } = await auth.db
    .from('products')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', auth.userId)
  if (error) return NextResponse.json({ error: 'Unable to delete product' }, { status: 500 })
  if (!count) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
