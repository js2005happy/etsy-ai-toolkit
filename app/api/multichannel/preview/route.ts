import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { generateCategoryAwareListing } from '@/lib/category-aware-generation'
import type { CommercePlatformId, ProductFactValue } from '@/lib/commerce/types'

const SUPPORTED: CommercePlatformId[] = ['etsy', 'shopify', 'woocommerce', 'amazon', 'ebay', 'tiktok', 'walmart', 'google']
const MAX_PLATFORMS = 5

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId } = auth

    const body = await request.json().catch(() => ({}))
    const productName = String(body.product_name || '').trim().slice(0, 180)
    const productType = String(body.product_type || '').trim().slice(0, 160)
    const material = String(body.material || '').trim().slice(0, 160)
    const style = String(body.style || '').trim().slice(0, 160)
    const facts = (body.facts && typeof body.facts === 'object' && !Array.isArray(body.facts))
      ? body.facts as Record<string, ProductFactValue>
      : undefined
    const requested = Array.isArray(body.platforms) ? body.platforms.map(String) : []
    const platforms = [...new Set(requested)]
      .filter((id): id is CommercePlatformId => SUPPORTED.includes(id as CommercePlatformId))
      .slice(0, MAX_PLATFORMS)

    if (!productName || !productType) {
      return NextResponse.json({ error: 'Product name and product type are required.' }, { status: 400 })
    }
    if (platforms.length < 2) {
      return NextResponse.json({ error: 'Choose at least two supported sales channels.' }, { status: 400 })
    }

    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const charged = await withCreditCharge(db, userId, 1, async () => {
      const previews = []
      for (const platform of platforms) {
        const result = await generateCategoryAwareListing({
          product_name: productName,
          product_type: productType,
          material,
          style,
          facts,
          platform,
          brand_tone: brandTone ?? undefined,
          brand_keywords: brandKeywords ?? undefined,
        })
        previews.push({ platform, ...result })
      }
      return previews
    })

    if (!charged.ok) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    }

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'multichannel_preview',
      input_data: { product_name: productName, product_type: productType, material, style, facts, platforms },
      output_data: charged.value,
    })

    return NextResponse.json({ previews: charged.value })
  } catch (error) {
    console.error('multichannel preview error:', error)
    return NextResponse.json({ error: 'Unable to generate multichannel previews right now.' }, { status: 500 })
  }
}
