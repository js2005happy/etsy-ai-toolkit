import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { optimizeCategoryAwareListing } from '@/lib/category-aware-generation'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId } = auth

    const body = await request.json()
    const { current_title, current_description, current_tags, platform, listing_id, product_type, material, style, facts } = body
    if (!current_title && !current_description && !current_tags) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 })
    }

    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const charged = await withCreditCharge(db, userId, 1, () => optimizeCategoryAwareListing({
      current_title,
      current_description,
      current_tags,
      product_type,
      material,
      style,
      facts,
      platform,
      brand_tone: brandTone ?? undefined,
      brand_keywords: brandKeywords ?? undefined,
    }))
    if (!charged.ok) return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    const result = charged.value

    if (Number.isSafeInteger(Number(listing_id))) {
      const { data: listing } = await db
        .from('etsy_listings')
        .select('id, title, description, tags, images, attributes, variations, price, quantity, taxonomy_id, state')
        .eq('id', Number(listing_id))
        .eq('user_id', userId)
        .maybeSingle()
      if (listing) {
        await db.from('etsy_listing_versions').insert({
          listing_id: listing.id,
          user_id: userId,
          source: 'ai',
          snapshot: listing,
        })
      }
    }

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'optimize_listing',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in optimize-listing:', error)
    return NextResponse.json({ error: "We couldn't optimize this listing. Please try again." }, { status: 500 })
  }
}
