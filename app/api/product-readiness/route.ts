import { NextResponse } from 'next/server'
import { evaluateProductReadiness } from '@/lib/product-readiness'
import type { CanonicalProduct, CommercePlatformId } from '@/lib/commerce/types'

const allowedPlatforms = new Set<CommercePlatformId>([
  'etsy',
  'shopify',
  'woocommerce',
  'amazon',
  'ebay',
  'tiktok',
  'walmart',
  'google',
])

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const product = body.product as CanonicalProduct | undefined
    if (!product || typeof product.title !== 'string' || product.title.trim().length < 2) {
      return NextResponse.json({ error: 'product.title is required.' }, { status: 400 })
    }

    const requestedPlatform = typeof body.platform === 'string' ? body.platform : undefined
    const platform = requestedPlatform && allowedPlatforms.has(requestedPlatform as CommercePlatformId)
      ? requestedPlatform as CommercePlatformId
      : undefined

    const readiness = evaluateProductReadiness(product, platform)
    return NextResponse.json(readiness)
  } catch (error) {
    console.error('product-readiness API error:', error)
    return NextResponse.json({ error: 'Unable to evaluate product readiness.' }, { status: 500 })
  }
}
