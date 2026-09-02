import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { consumeImageCredits } from '@/lib/quota'
import { generateProductImage, type ProductImageInput } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId, hasImageAccess, imageCredits } = auth

    const body: ProductImageInput = await request.json()
    if (!body.product_name || !body.product_description || !body.platform || !body.size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!hasImageAccess) {
      return NextResponse.json(
        { error: 'No image credits available. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    const result = await generateProductImage(body)

    await consumeImageCredits(db, userId, 1)

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'image',
      input_data: body,
      output_data: { revised_prompt: result.revised_prompt ?? null },
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
