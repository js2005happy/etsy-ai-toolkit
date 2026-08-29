import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { optimizeListing } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId, credits } = auth

    const body = await request.json()
    const { current_title, current_description, current_tags } = body

    if (!current_title && !current_description && !current_tags) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 })
    }

    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    }

    const result = await optimizeListing({ current_title, current_description, current_tags })

    await db.from('profiles').update({ credits_remaining: credits - 1 }).eq('id', userId)

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'optimize_listing',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in optimize-listing:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
