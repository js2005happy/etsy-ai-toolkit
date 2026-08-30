import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { generateProductImages, type ProductImageInput } from '@/lib/openai'

const MAX_ITEMS = 10

function isValidInput(item: ProductImageInput): boolean {
  return !!(item.product_name && item.product_description && item.platform && item.size)
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
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

    if (!hasImageAccess) {
      return NextResponse.json(
        { error: 'Image generation requires the Pro plan or above. Please upgrade.' },
        { status: 403 }
      )
    }
    if (imageCredits < items.length) {
      return NextResponse.json(
        {
          error: `Insufficient image credits. Need ${items.length}, have ${imageCredits}.`,
          needed: items.length,
          have: imageCredits,
        },
        { status: 403 }
      )
    }

    const images = await generateProductImages(items)

    await db
      .from('profiles')
      .update({ images_remaining: imageCredits - items.length })
      .eq('id', userId)

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
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
