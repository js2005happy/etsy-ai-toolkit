import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { generateCategoryAwareListing } from '@/lib/category-aware-generation'
import type { CommercePlatformId, ProductFactValue } from '@/lib/commerce/types'
import type { ProductCategory } from '@/lib/product-profiles'

const SUPPORTED: CommercePlatformId[] = ['etsy','shopify','woocommerce','amazon','ebay','tiktok','walmart','google']
const CATEGORIES = new Set<ProductCategory>(['apparel','jewelry','home-decor','art-print','personalized-gift','digital-product','beauty','food','electronics','accessories','craft-supplies','generic'])
const MAX_PLATFORMS = 5

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId } = auth

    const body = await request.json().catch(() => ({}))
    const productId = typeof body.product_id === 'string' ? body.product_id : undefined
    let source: any = null
    if (productId) {
      const { data } = await db.from('products').select('*').eq('id', productId).eq('user_id', userId).maybeSingle()
      if (!data) return NextResponse.json({ error: 'Canonical product not found.' }, { status: 404 })
      source = data
    }

    const productName = String(source?.title ?? body.product_name ?? '').trim().slice(0, 180)
    const productType = String(source?.product_type ?? body.product_type ?? '').trim().slice(0, 160)
    const material = String(source?.material ?? body.material ?? '').trim().slice(0, 160)
    const style = String(source?.style ?? body.style ?? '').trim().slice(0, 160)
    const categoryRaw = String(source?.category ?? body.category ?? 'generic') as ProductCategory
    const category = CATEGORIES.has(categoryRaw) ? categoryRaw : 'generic'
    const facts = source?.facts && typeof source.facts === 'object'
      ? source.facts as Record<string, ProductFactValue>
      : body.facts && typeof body.facts === 'object' && !Array.isArray(body.facts)
        ? body.facts as Record<string, ProductFactValue>
        : undefined
    const requested: string[] = Array.isArray(body.platforms) ? body.platforms.map(String) : []
    const platforms = Array.from(new Set<string>(requested)).filter((id): id is CommercePlatformId => SUPPORTED.includes(id as CommercePlatformId)).slice(0, MAX_PLATFORMS)

    if (!productName || !productType) return NextResponse.json({ error: 'Product name and product type are required.' }, { status: 400 })
    if (platforms.length < 2) return NextResponse.json({ error: 'Choose at least two supported sales channels.' }, { status: 400 })

    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const charged = await withCreditCharge(db, userId, 1, async () => {
      const previews = []
      for (const platform of platforms) {
        const result = await generateCategoryAwareListing({
          product_name: productName,
          product_type: productType,
          category,
          material,
          style,
          brand: source?.brand ?? body.brand,
          sku: source?.sku ?? body.sku,
          price: source?.price == null ? body.price : Number(source.price),
          currency: source?.currency ?? body.currency,
          inventory_quantity: source?.inventory_quantity == null ? body.inventory_quantity : Number(source.inventory_quantity),
          facts,
          platform,
          brand_tone: brandTone ?? undefined,
          brand_keywords: brandKeywords ?? undefined,
        })
        previews.push({
          platform,
          ...result,
          price: source?.price == null ? body.price ?? null : Number(source.price),
          currency: source?.currency ?? body.currency ?? null,
          inventory_quantity: source?.inventory_quantity == null ? body.inventory_quantity ?? null : Number(source.inventory_quantity),
        })
      }
      return previews
    })

    if (!charged.ok) return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'multichannel_preview',
      input_data: { product_id: productId, product_name: productName, product_type: productType, category, material, style, facts, platforms },
      output_data: charged.value,
    })

    return NextResponse.json({ product_id: productId ?? null, previews: charged.value })
  } catch (error) {
    console.error('multichannel preview error:', error)
    return NextResponse.json({ error: 'Unable to generate multichannel previews right now.' }, { status: 500 })
  }
}
