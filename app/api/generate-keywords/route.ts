import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { generateKeywords } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId } = auth

    const body = await request.json()
    const { product_type, market, style, platform } = body
    if (!product_type) return NextResponse.json({ error: 'Missing product_type' }, { status: 400 })

    const charged = await withCreditCharge(db, userId, 1, () => generateKeywords({ product_type, market, style, platform }))
    if (!charged.ok) return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    const result = charged.value

    await db.from('generations').insert({ user_id: userId, tool_type: 'keyword_research', input_data: body, output_data: result })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in generate-keywords:', error)
    return NextResponse.json({ error: "We couldn't generate keywords. Please try again." }, { status: 500 })
  }
}
