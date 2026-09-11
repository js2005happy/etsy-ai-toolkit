import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,47}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanText(value: unknown, max: number): string | null {
  if (value == null) return null
  const text = String(value).trim()
  return text ? text.slice(0, max) : null
}

function httpsUrl(value: unknown): string | null {
  const cleaned = cleanText(value, 1000)
  if (!cleaned) return null
  try {
    const url = new URL(cleaned)
    if (url.protocol !== 'https:') return null
    if (url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
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

  const rawLogo = cleanText(body.logo_url, 1000)
  const rawBanner = cleanText(body.banner_url, 1000)
  const logoUrl = httpsUrl(body.logo_url)
  const bannerUrl = httpsUrl(body.banner_url)
  if (rawLogo && !logoUrl) return NextResponse.json({ error: 'Logo URL must be a valid HTTPS URL.' }, { status: 400 })
  if (rawBanner && !bannerUrl) return NextResponse.json({ error: 'Banner URL must be a valid HTTPS URL.' }, { status: 400 })

  const contactEmail = cleanText(body.contact_email, 320)
  if (contactEmail && !EMAIL_RE.test(contactEmail)) return NextResponse.json({ error: 'Contact email is invalid.' }, { status: 400 })
  const currency = (cleanText(body.currency, 8) || 'USD').toUpperCase()
  if (!/^[A-Z]{3,8}$/.test(currency)) return NextResponse.json({ error: 'Currency code is invalid.' }, { status: 400 })

  const payload = {
    user_id: auth.userId,
    slug,
    name,
    headline: cleanText(body.headline, 180),
    description: cleanText(body.description, 3000),
    logo_url: logoUrl,
    banner_url: bannerUrl,
    contact_email: contactEmail,
    currency,
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
