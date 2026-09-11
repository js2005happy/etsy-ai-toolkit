import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,47}$/

function cleanText(value: unknown, max: number): string | null {
  if (value == null) return null
  const text = String(value).trim()
  return text ? text.slice(0, max) : null
}

export async function GET(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { data, error } = await auth.db
    .from('storefronts')
    .select('id,slug,name,headline,description,logo_url,banner_url,contact_email,currency,is_published,seo_title,seo_description,created_at,updated_at,storefront_products(product_id,sort_order,is_visible)')
    .eq('user_id', auth.userId)
    .maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to load storefront' }, { status: 500 })
  return NextResponse.json({ storefront: data ?? null })
}

export async function PUT(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await request.json().catch(() => ({}))
  const slug = String(body.slug || '').trim().toLowerCase()
  const name = cleanText(body.name, 120)
  if (!SLUG_RE.test(slug)) return NextResponse.json({ error: 'Store slug must be 3-48 lowercase letters, numbers or hyphens.' }, { status: 400 })
  if (!name) return NextResponse.json({ error: 'Store name is required.' }, { status: 400 })

  const payload = {
    user_id: auth.userId,
    slug,
    name,
    headline: cleanText(body.headline, 180),
    description: cleanText(body.description, 3000),
    logo_url: cleanText(body.logo_url, 1000),
    banner_url: cleanText(body.banner_url, 1000),
    contact_email: cleanText(body.contact_email, 320),
    currency: (cleanText(body.currency, 8) || 'USD').toUpperCase(),
    is_published: Boolean(body.is_published),
    seo_title: cleanText(body.seo_title, 70),
    seo_description: cleanText(body.seo_description, 170),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await auth.db
    .from('storefronts')
    .upsert(payload, { onConflict: 'user_id' })
    .select('id,slug,name,headline,description,logo_url,banner_url,contact_email,currency,is_published,seo_title,seo_description,created_at,updated_at')
    .single()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That storefront URL is already taken.' }, { status: 409 })
    console.error('Storefront save failed', error)
    return NextResponse.json({ error: 'Unable to save storefront' }, { status: 500 })
  }
  return NextResponse.json({ storefront: data })
}
