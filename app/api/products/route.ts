import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

const ALLOWED_CATEGORIES = new Set([
  'apparel','jewelry','home-decor','art-print','personalized-gift','digital-product','beauty','food','electronics','accessories','craft-supplies','generic',
])

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

export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 100)
  const status = url.searchParams.get('status')

  let query = auth.db
    .from('products')
    .select('id,title,description,category,product_type,brand,material,style,sku,price,currency,inventory_quantity,tags,images,facts,shipping,compliance,status,created_at,updated_at')
    .eq('user_id', auth.userId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (status && ['draft', 'ready', 'archived'].includes(status)) query = query.eq('status', status)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Unable to load products' }, { status: 500 })
  return NextResponse.json({ products: data ?? [] })
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const title = text(body.title, 240)
  if (!title) return NextResponse.json({ error: 'Product title is required' }, { status: 400 })

  const category = ALLOWED_CATEGORIES.has(String(body.category)) ? String(body.category) : 'generic'
  const price = numberOrNull(body.price)
  const inventory = numberOrNull(body.inventory_quantity)
  if (price != null && price < 0) return NextResponse.json({ error: 'Price cannot be negative' }, { status: 400 })
  if (inventory != null && (!Number.isInteger(inventory) || inventory < 0)) return NextResponse.json({ error: 'Inventory must be a non-negative integer' }, { status: 400 })

  const payload = {
    user_id: auth.userId,
    title,
    description: text(body.description, 20000),
    category,
    product_type: text(body.product_type, 180),
    brand: text(body.brand, 180),
    material: text(body.material, 500),
    style: text(body.style, 300),
    sku: text(body.sku, 180),
    price,
    currency: text(body.currency, 8) || 'USD',
    inventory_quantity: inventory,
    tags: Array.isArray(body.tags) ? body.tags.map(String).map((v: string) => v.trim()).filter(Boolean).slice(0, 50) : [],
    images: Array.isArray(body.images) ? body.images.slice(0, 30) : [],
    facts: body.facts && typeof body.facts === 'object' && !Array.isArray(body.facts) ? body.facts : {},
    shipping: body.shipping && typeof body.shipping === 'object' && !Array.isArray(body.shipping) ? body.shipping : {},
    compliance: body.compliance && typeof body.compliance === 'object' && !Array.isArray(body.compliance) ? body.compliance : {},
    status: ['draft','ready','archived'].includes(String(body.status)) ? String(body.status) : 'draft',
  }

  const { data, error } = await auth.db.from('products').insert(payload).select('*').single()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That SKU is already used by another product.' }, { status: 409 })
    console.error('Create product failed', error)
    return NextResponse.json({ error: 'Unable to create product' }, { status: 500 })
  }
  return NextResponse.json({ product: data }, { status: 201 })
}
