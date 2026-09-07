import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { consumeCredits } from '@/lib/quota'
import { optimizeListing } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId, credits } = auth

    const body = await request.json()
    const { current_title, current_description, current_tags, platform, listing_id } = body

    if (!current_title && !current_description && !current_tags) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 })
    }

    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    }

    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const result = await optimizeListing({ current_title, current_description, current_tags, platform, brand_tone: brandTone ?? undefined, brand_keywords: brandKeywords ?? undefined })

    // A workspace optimization never overwrites the imported listing. Preserve
    // the current user-owned snapshot before a later reviewed apply action.
    if (Number.isSafeInteger(Number(listing_id))) {
      const { data: listing } = await db.from('etsy_listings').select('id, title, description, tags, images, attributes, variations, price, quantity, taxonomy_id, state').eq('id', Number(listing_id)).eq('user_id', userId).maybeSingle()
      if (listing) await db.from('etsy_listing_versions').insert({ listing_id: listing.id, user_id: userId, source: 'ai', snapshot: listing })
    }

    await consumeCredits(db, userId, 1)

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'optimize_listing',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in optimize-listing:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
