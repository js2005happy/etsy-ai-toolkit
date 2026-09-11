import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

const MUTABLE = new Set([
  'title','description','category','product_type','brand','material','style','sku','price','currency','inventory_quantity','tags','images','facts','shipping','compliance','status',
])
const STATUSES = new Set(['draft','ready','archived'])
const CATEGORIES = new Set(['apparel','jewelry','home-decor','art-print','personalized-gift','digital-product','beauty','food','electronics','accessories','craft-supplies','generic'])

async function idFrom(params: Promise<{ id: string }>) {
  const { id } = await params
  return id
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function cleanText(value: unknown, max: number): string | null {
  if (value == null) return null
  const s = String(value).trim()
  return s ? s.slice(0, max) : null
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
  if (!isObject(body)) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const [key, value] of Object.entries(body)) {
    if (MUTABLE.has(key)) update[key] = value
  }

  for (const [key, max] of Object.entries({ title: 240, description: 20000, product_type: 180, brand: 180, material: 500, style: 300, sku: 180 })) {
    if (key in update) update[key] = cleanText(update[key], max)
  }
  if ('title' in update && !update.title) return NextResponse.json({ error: 'Product title cannot be empty' }, { status: 400 })

  if ('category' in update) update.category = CATEGORIES.has(String(update.category)) ? String(update.category) : 'generic'
  if ('status' in update && !STATUSES.has(String(update.status))) return NextResponse.json({ error: 'Invalid product status' }, { status: 400 })
  if ('currency' in update) {
    const currency = cleanText(update.currency, 8)?.toUpperCase()
    if (!currency || !/^[A-Z]{3,8}$/.test(currency)) return NextResponse.json({ error: 'Invalid currency code' }, { status: 400 })
    update.currency = currency
  }
  if ('price' in update && update.price != null) {
    const n = Number(update.price)
    if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: 'Price cannot be negative or invalid' }, { status: 400 })
    update.price = n
  }
  if ('inventory_quantity' in update && update.inventory_quantity != null) {
    const n = Number(update.inventory_quantity)
    if (!Number.isInteger(n) || n < 0) return NextResponse.json({ error: 'Inventory must be a non-negative integer' }, { status: 400 })
    update.inventory_quantity = n
  }
  if ('tags' in update) {
    if (!Array.isArray(update.tags)) return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 })
    update.tags = update.tags.map((value) => String(value).trim().slice(0, 100)).filter(Boolean).slice(0, 50)
  }
  if ('images' in update) {
    if (!Array.isArray(update.images)) return NextResponse.json({ error: 'Images must be an array' }, { status: 400 })
    const images = update.images.slice(0, 30).map((value) => {
      if (typeof value === 'string') return { url: value.slice(0, 2000) }
      if (!isObject(value)) return null
      const url = cleanText(value.url, 2000)
      if (!url || !/^https:\/\//i.test(url)) return null
      return {
        url,
        alt: cleanText(value.alt, 300) ?? undefined,
        role: ['hero','detail','scale','lifestyle','variant','guide','other'].includes(String(value.role)) ? String(value.role) : 'other',
      }
    }).filter(Boolean)
    if (images.length !== update.images.slice(0, 30).length) return NextResponse.json({ error: 'Every image must use a valid HTTPS URL' }, { status: 400 })
    update.images = images
  }
  for (const key of ['facts','shipping','compliance']) {
    if (key in update && !isObject(update[key])) return NextResponse.json({ error: `${key} must be an object` }, { status: 400 })
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
    console.error('Update product failed', error)
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
