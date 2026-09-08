import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { translateImage } from '@/lib/openai'

// ~7MB decoded image (10M base64 chars) — enough for a product graphic while
// capping the payload before it reaches the vision model.
const MAX_IMAGE_BASE64 = 10_000_000

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId } = auth

    const body = await request.json()
    const { image, target_language } = body

    if (!image || !target_language) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
    }
    if (image.length > MAX_IMAGE_BASE64) {
      return NextResponse.json({ error: 'Image too large (max ~7MB)' }, { status: 413 })
    }

    const charged = await withCreditCharge(db, userId, 1, () => translateImage({ image, target_language }))
    if (!charged.ok) return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    const result = charged.value

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'translate_image',
      input_data: { target_language },
      output_data: { translated_text: result.translated_text },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in translate-image:', error)
    return NextResponse.json({ error: "We couldn't translate this image. Please try again." }, { status: 500 })
  }
}
