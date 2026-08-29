import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { generateAnnouncement } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId, credits } = auth

    const body = await request.json()
    const { shop_type, announcement_type, tone } = body

    if (!shop_type || !announcement_type || !tone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    }

    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const result = await generateAnnouncement({ shop_type, announcement_type, tone, brand_tone: brandTone ?? undefined, brand_keywords: brandKeywords ?? undefined })

    await db.from('profiles').update({ credits_remaining: credits - 1 }).eq('id', userId)

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'announcement',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in generate-announcement:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
