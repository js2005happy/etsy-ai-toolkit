import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { translateListing } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId } = auth

    const body = await request.json()
    const { text, target_language, platform } = body
    if (!text || !target_language) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const charged = await withCreditCharge(db, userId, 1, () => translateListing({ text, target_language, platform }))
    if (!charged.ok) return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    const result = charged.value

    await db.from('generations').insert({ user_id: userId, tool_type: 'translate', input_data: body, output_data: result })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in translate-listing:', error)
    return NextResponse.json({ error: "We couldn't translate this listing. Please try again." }, { status: 500 })
  }
}
