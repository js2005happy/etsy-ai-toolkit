import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { generateListing, type ListingInput } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId, credits } = auth

    const body: ListingInput = await request.json()
    if (!body.product_name || !body.product_type || !body.material || !body.style) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
    }

    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const result = await generateListing({ ...body, brand_tone: brandTone ?? undefined, brand_keywords: brandKeywords ?? undefined })

    await db.from('profiles').update({ credits_remaining: credits - 1 }).eq('id', userId)

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
