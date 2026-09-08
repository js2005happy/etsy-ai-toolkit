import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { generateEmail } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId } = auth

    const body = await request.json()
    const { email_type, product_name, product_description, audience } = body

    if (!email_type || !product_name || !product_description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const charged = await withCreditCharge(db, userId, 1, () => generateEmail({
      email_type,
      product_name,
      product_description,
      audience,
      brand_tone: brandTone ?? undefined,
      brand_keywords: brandKeywords ?? undefined,
    }))
    if (!charged.ok) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
    }
    const result = charged.value

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'email',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in generate-email:', error)
    return NextResponse.json({ error: "We couldn't generate this email. Please try again." }, { status: 500 })
  }
}
