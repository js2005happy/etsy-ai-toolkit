import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { generateCompetitorAnalysis } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId } = auth

    const body = await request.json()
    const { product_name, product_description, competitor_name, competitor_description, platform } = body
    if (!product_name || !product_description) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const charged = await withCreditCharge(db, userId, 1, () => generateCompetitorAnalysis({
      product_name,
      product_description,
      competitor_name,
      competitor_description,
      platform,
    }))
    if (!charged.ok) return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
    const result = charged.value

    await db.from('generations').insert({ user_id: userId, tool_type: 'competitor_analysis', input_data: body, output_data: result })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in generate-competitor-analysis:', error)
    return NextResponse.json({ error: "We couldn't analyze this listing. Please try again." }, { status: 500 })
  }
}
