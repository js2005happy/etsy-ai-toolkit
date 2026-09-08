import { NextResponse } from 'next/server'
import { authenticateRequest, getBrandPrefs } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { generateMessageReply, type MessageReplyInput } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId } = auth

    const body: MessageReplyInput = await request.json()
    if (!body.customer_message || !body.tone) {
      return NextResponse.json({ error: 'Missing required fields: customer_message and tone are required' }, { status: 400 })
    }

    const { brandTone, brandKeywords } = await getBrandPrefs(db, userId)
    const charged = await withCreditCharge(db, userId, 1, () => generateMessageReply({
      ...body,
      brand_tone: brandTone ?? undefined,
      brand_keywords: brandKeywords ?? undefined,
    }))
    if (!charged.ok) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
    }
    const result = charged.value

    await db.from('generations').insert({ user_id: userId, tool_type: 'message', input_data: body, output_data: result })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in generate-message-reply:', error)
    return NextResponse.json({ error: "We couldn't generate this reply. Please try again." }, { status: 500 })
  }
}
