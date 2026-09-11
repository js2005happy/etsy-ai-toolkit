import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

function text(value: unknown, max: number): string | null {
  if (value == null) return null
  const s = String(value).trim()
  return s ? s.slice(0, max) : null
}

function numberOrNull(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

async function productOwned(auth: any, id: string) {
  const { data } = await auth.db.from('products').select('id').eq('id', id).eq('user_id', auth.userId).maybeSingle()
  return Boolean(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id: productId } = await params
  if (!(await productOwned(auth, productId))) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const title = text(body.title, 200)
  if (!title) return NextResponse.json({ error: 'Variant title is required' }, { status: 400 })
  const price = numberOrNull(body.price)
  const compareAt = numberOrNull(body.compare_at_price)
  const inventory = numberOrNull(body.inventory_quantity)
  const weight = numberOrNull(body.weight_grams)
  if (price != null && price < 0) return NextResponse.json({ error: 'Price cannot be negative' }, { status: 400 })
  if (compareAt != null && compareAt < 0) return NextResponse.json({ error: 'Compare-at price cannot be negative' }, { status: 400 })
  if (inventory != null && (!Number.isInteger(inventory) || inventory < 0)) return NextResponse.json({ error: 'Inventory must be a non-negative integer' }, { status: 400 })
  if (weight != null && (!Number.isInteger(weight) || weight < 0)) return NextResponse.json({ error: 'Weight must be a non-negative integer in grams' }, { status: 400 })

  const payload = {
    product_id: productId,
    user_id: auth.userId,
    title,
    sku: text(body.sku, 180),
    options: body.options && typeof body.options === 'object' && !Array.isArray(body.options) ? body.options : {},
    price,
    compare_at_price: compareAt,
    currency: text(body.currency, 8),
    inventory_quantity: inventory,
    barcode: text(body.barcode, 180),
    weight_grams: weight,
    image_url: text(body.image_url, 2000),
  }
  const { data, error } = await auth.db.from('product_variants').insert(payload).select('*').single()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That SKU is already used.' }, { status: 409 })
    return NextResponse.json({ error: 'Unable to create variant' }, { status: 500 })
  }
  return NextResponse.json({ variant: data }, { status: 201 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id: productId } = await params
  const body = await request.json().catch(() => ({}))
  const variantId = String(body.id || '').trim()
  if (!variantId) return NextResponse.json({ error: 'Variant id is required' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of ['title','sku','options','price','compare_at_price','currency','inventory_quantity','barcode','weight_grams','image_url']) {
    if (key in body) update[key] = body[key]
  }
  if ('title' in update && !String(update.title || '').trim()) return NextResponse.json({ error: 'Variant title cannot be empty' }, { status: 400 })
  for (const key of ['price','compare_at_price']) if (key in update && update[key] != null && Number(update[key]) < 0) return NextResponse.json({ error: `${key} cannot be negative` }, { status: 400 })
  if ('inventory_quantity' in update && update.inventory_quantity != null && (!Number.isInteger(Number(update.inventory_quantity)) || Number(update.inventory_quantity) < 0)) return NextResponse.json({ error: 'Inventory must be a non-negative integer' }, { status: 400 })
  if ('weight_grams' in update && update.weight_grams != null && (!Number.isInteger(Number(update.weight_grams)) || Number(update.weight_grams) < 0)) return NextResponse.json({ error: 'Weight must be a non-negative integer' }, { status: 400 })

  const { data, error } = await auth.db.from('product_variants').update(update).eq('id', variantId).eq('product_id', productId).eq('user_id', auth.userId).select('*').maybeSingle()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That SKU is already used.' }, { status: 409 })
    return NextResponse.json({ error: 'Unable to update variant' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
  return NextResponse.json({ variant: data })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id: productId } = await params
  const body = await request.json().catch(() => ({}))
  const variantId = String(body.id || '').trim()
  if (!variantId) return NextResponse.json({ error: 'Variant id is required' }, { status: 400 })
  const { error, count } = await auth.db.from('product_variants').delete({ count: 'exact' }).eq('id', variantId).eq('product_id', productId).eq('user_id', auth.userId)
  if (error) return NextResponse.json({ error: 'Unable to delete variant' }, { status: 500 })
  if (!count) return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
