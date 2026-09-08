import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { withImageCreditCharge } from '@/lib/quota'
import { generateProductImages, type ProductImageInput } from '@/lib/openai'

const MAX_ITEMS = 10

function isValidInput(item: ProductImageInput): boolean {
  return !!(item.product_name && item.product_description && item.platform && item.size)
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId, hasImageAccess, imageCredits } = auth

    const body = await request.json()
    const items: ProductImageInput[] = body?.items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items must be a non-empty array' }, { status: 400 })
    }
    if (items.length > MAX_ITEMS) {
      return NextResponse.json({ error: `Too many items (max ${MAX_ITEMS})` }, { status: 400 })
    }
    if (!items.every(isValidInput)) {
      return NextResponse.json({ error: 'Missing required fields on one or more items' }, { status: 400 })
    }

    if (!hasImageAccess || imageCredits < items.length) {
      return NextResponse.json(
        {
          error: `Insufficient image credits. Need ${items.length}, have ${imageCredits}.`,
          needed: items.length,
          have: imageCredits,
        },
        { status: 403 }
      )
    }

    const charged = await withImageCreditCharge(db, userId, items.length, () => generateProductImages(items))
    if (!charged.ok) {
      return NextResponse.json(
        { error: 'Insufficient image credits. Your quota may have changed; refresh and try again.' },
        { status: 403 }
      )
    }
    const images = charged.value

    await Promise.all(
      items.map((item, i) =>
        db.from('generations').insert({
          user_id: userId,
          tool_type: 'image',
          input_data: item,
          output_data: { revised_prompt: images[i]?.revised_prompt ?? null },
        })
      )
    )

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error in generate-images:', error)
    return NextResponse.json({ error: "We couldn't generate these images. Please try again." }, { status: 500 })
  }
}
