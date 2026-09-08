import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { generateBrandStory } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId } = auth

    const body = await request.json()
    const { brand_name, product_type, origin_story, values, audience } = body
    if (!brand_name || !product_type) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const charged = await withCreditCharge(db, userId, 1, () => generateBrandStory({
      brand_name,
      product_type,
      origin_story,
      values,
      audience,
    }))
    if (!charged.ok) return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
    const result = charged.value

    await db.from('generations').insert({ user_id: userId, tool_type: 'brand_story', input_data: body, output_data: result })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in generate-brand-story:', error)
    return NextResponse.json({ error: "We couldn't generate this brand story. Please try again." }, { status: 500 })
  }
}
