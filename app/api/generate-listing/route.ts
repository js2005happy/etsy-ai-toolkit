import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { generateCategoryAwareListing, type CategoryAwareListingInput } from '@/lib/category-aware-generation'

const FREE_LISTING_TRIAL = 3

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId, tier } = auth

    const body: CategoryAwareListingInput = await request.json()
    if (!body.product_name || !body.product_type) {
      return NextResponse.json({ error: 'Product name and product type are required' }, { status: 400 })
    }

    const { count } = await db
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('tool_type', 'listing')

    const withinTrial = tier === 'Free' && (count ?? 0) < FREE_LISTING_TRIAL
    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const generate = () => generateCategoryAwareListing({
      ...body,
      brand_tone: brandTone ?? undefined,
      brand_keywords: brandKeywords ?? undefined,
    })

    let result
    if (withinTrial) {
      result = await generate()
    } else {
      const charged = await withCreditCharge(db, userId, 1, generate)
      if (!charged.ok) {
        return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
      }
      result = charged.value
    }

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'listing',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in generate-listing:', error)
    return NextResponse.json({ error: "We couldn't generate this listing. Please try again." }, { status: 500 })
  }
}
