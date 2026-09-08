import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { withImageCreditCharge } from '@/lib/quota'
import { generateProductImage, type ProductImageInput } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId, hasImageAccess } = auth

    const body: ProductImageInput = await request.json()
    if (!body.product_name || !body.product_description || !body.platform || !body.size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!hasImageAccess) {
      return NextResponse.json({ error: 'No image credits available. Please upgrade your plan.' }, { status: 403 })
    }

    const charged = await withImageCreditCharge(db, userId, 1, () => generateProductImage(body))
    if (!charged.ok) {
      return NextResponse.json({ error: 'No image credits available. Please upgrade your plan.' }, { status: 403 })
    }
    const result = charged.value

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'image',
      input_data: body,
      output_data: { revised_prompt: result.revised_prompt ?? null },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in generate-image:', error)
    return NextResponse.json({ error: "We couldn't generate this image. Please try again." }, { status: 500 })
  }
}
