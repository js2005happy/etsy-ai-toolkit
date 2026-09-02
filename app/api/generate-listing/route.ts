import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { consumeCredits } from '@/lib/quota'
import { generateListing, type ListingInput } from '@/lib/openai'

// Free users get their first 3 listings without spending credits, so they can
// run the full "notes → publishable listing" loop before the monthly quota
// kicks in (see lib/pricing — Free is a milestone, not a meter).
const FREE_LISTING_TRIAL = 3

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId, credits, tier } = auth

    const body: ListingInput = await request.json()
    if (!body.product_name || !body.product_type || !body.material || !body.style) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { count } = await db
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('tool_type', 'listing')

    const withinTrial = tier === 'Free' && (count ?? 0) < FREE_LISTING_TRIAL

    if (!withinTrial && credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
    }

    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const result = await generateListing({ ...body, brand_tone: brandTone ?? undefined, brand_keywords: brandKeywords ?? undefined })

    if (!withinTrial) {
      await consumeCredits(db, userId, 1)
    }

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'listing',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
