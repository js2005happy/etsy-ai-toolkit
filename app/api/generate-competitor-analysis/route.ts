import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { consumeCredits } from '@/lib/quota'
import { generateCompetitorAnalysis } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId, credits } = auth

    const body = await request.json()
    const { product_name, product_description, competitor_name, competitor_description, platform } = body

    if (!product_name || !product_description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
    }

    const result = await generateCompetitorAnalysis({
      product_name,
      product_description,
      competitor_name,
      competitor_description,
      platform,
    })

    await consumeCredits(db, userId, 1)

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'competitor_analysis',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in generate-competitor-analysis:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
