import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { consumeCredits } from '@/lib/quota'
import { generateEmail } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId, credits } = auth

    const body = await request.json()
    const { email_type, product_name, product_description, audience } = body

    if (!email_type || !product_name || !product_description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
    }

    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const result = await generateEmail({
      email_type,
      product_name,
      product_description,
      audience,
      brand_tone: brandTone ?? undefined,
      brand_keywords: brandKeywords ?? undefined,
    })

    await consumeCredits(db, userId, 1)

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'email',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in generate-email:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
