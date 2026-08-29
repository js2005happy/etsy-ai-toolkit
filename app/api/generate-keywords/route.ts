import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { generateKeywords } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId, credits } = auth

    const body = await request.json()
    const { product_type, market, style } = body

    if (!product_type) {
      return NextResponse.json({ error: 'Missing product_type' }, { status: 400 })
    }

    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    }

    const result = await generateKeywords({ product_type, market, style })

    await db.from('profiles').update({ credits_remaining: credits - 1 }).eq('id', userId)

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'keyword_research',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in generate-keywords:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
