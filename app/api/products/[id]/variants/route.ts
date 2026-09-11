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

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function cleanOptions(value: unknown): Record<string, string> {
  if (!isObject(value)) return {}
  const entries = Object.entries(value)
    .slice(0, 20)
    .map(([key, raw]) => [String(key).trim().slice(0, 80), String(raw ?? '').trim().slice(0, 160)] as const)
    .filter(([key, val]) => key && val)
  return Object.fromEntries(entries)
}

function cleanCurrency(value: unknown): string | null {
  const currency = text(value, 8)?.toUpperCase() ?? null
  if (!currency) return null
  return /^[A-Z]{3,8}$/.test(currency) ? currency : null
}

function cleanHttpsUrl(value: unknown): string | null {
  const url = text(value, 2000)
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null
    return parsed.toString()
  } catch {
    return null
  }
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
  if (!isObject(body)) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
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

  const rawCurrency = body.currency == null || body.currency === '' ? null : body.currency
  const currency = rawCurrency == null ? null : cleanCurrency(rawCurrency)
  if (rawCurrency != null && !currency) return NextResponse.json({ error: 'Invalid currency code' }, { status: 400 })
  const rawImage = body.image_url == null || body.image_url === '' ? null : body.image_url
  const imageUrl = rawImage == null ? null : cleanHttpsUrl(rawImage)
  if (rawImage != null && !imageUrl) return NextResponse.json({ error: 'Variant image URL must use HTTPS' }, { status: 400 })

  const payload = {
    product_id: productId,
    user_id: auth.userId,
    title,
    sku: text(body.sku, 180),
    options: cleanOptions(body.options),
    price,
    compare_at_price: compareAt,
    currency,
    inventory_quantity: inventory,
    barcode: text(body.barcode, 180),
    weight_grams: weight,
    image_url: imageUrl,
  }
  const { data, error } = await auth.db.from('product_variants').insert(payload).select('*').single()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That SKU is already used.' }, { status: 409 })
    console.error('Create variant failed', error)
    return NextResponse.json({ error: 'Unable to create variant' }, { status: 500 })
  }
  return NextResponse.json({ variant: data }, { status: 201 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id: productId } = await params
  const body = await request.json().catch(() => ({}))
  if (!isObject(body)) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  const variantId = String(body.id || '').trim()
  if (!variantId) return NextResponse.json({ error: 'Variant id is required' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('title' in body) {
    const title = text(body.title, 200)
    if (!title) return NextResponse.json({ error: 'Variant title cannot be empty' }, { status: 400 })
    update.title = title
  }
  if ('sku' in body) update.sku = text(body.sku, 180)
  if ('barcode' in body) update.barcode = text(body.barcode, 180)
  if ('options' in body) {
    if (!isObject(body.options)) return NextResponse.json({ error: 'Variant options must be an object' }, { status: 400 })
    update.options = cleanOptions(body.options)
  }
  for (const key of ['price','compare_at_price'] as const) {
    if (key in body) {
      const n = numberOrNull(body[key])
      if (body[key] != null && body[key] !== '' && n == null) return NextResponse.json({ error: `${key} is invalid` }, { status: 400 })
      if (n != null && n < 0) return NextResponse.json({ error: `${key} cannot be negative` }, { status: 400 })
      update[key] = n
    }
  }
  if ('inventory_quantity' in body) {
    const n = numberOrNull(body.inventory_quantity)
    if (body.inventory_quantity != null && body.inventory_quantity !== '' && n == null) return NextResponse.json({ error: 'Inventory is invalid' }, { status: 400 })
    if (n != null && (!Number.isInteger(n) || n < 0)) return NextResponse.json({ error: 'Inventory must be a non-negative integer' }, { status: 400 })
    update.inventory_quantity = n
  }
  if ('weight_grams' in body) {
    const n = numberOrNull(body.weight_grams)
    if (body.weight_grams != null && body.weight_grams !== '' && n == null) return NextResponse.json({ error: 'Weight is invalid' }, { status: 400 })
    if (n != null && (!Number.isInteger(n) || n < 0)) return NextResponse.json({ error: 'Weight must be a non-negative integer' }, { status: 400 })
    update.weight_grams = n
  }
  if ('currency' in body) {
    const raw = body.currency == null || body.currency === '' ? null : body.currency
    const currency = raw == null ? null : cleanCurrency(raw)
    if (raw != null && !currency) return NextResponse.json({ error: 'Invalid currency code' }, { status: 400 })
    update.currency = currency
  }
  if ('image_url' in body) {
    const raw = body.image_url == null || body.image_url === '' ? null : body.image_url
    const imageUrl = raw == null ? null : cleanHttpsUrl(raw)
    if (raw != null && !imageUrl) return NextResponse.json({ error: 'Variant image URL must use HTTPS' }, { status: 400 })
    update.image_url = imageUrl
  }

  const { data, error } = await auth.db.from('product_variants').update(update).eq('id', variantId).eq('product_id', productId).eq('user_id', auth.userId).select('*').maybeSingle()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That SKU is already used.' }, { status: 409 })
    console.error('Update variant failed', error)
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
