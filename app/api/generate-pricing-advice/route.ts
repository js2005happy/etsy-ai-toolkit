import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { withCreditCharge } from '@/lib/quota'
import { generatePricingAdvice } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { db, userId } = auth

    const body = await request.json()
    const { material_cost, labor_cost, shipping_cost, competitor_price_min, competitor_price_max, desired_profit_margin, platform } = body

    if (material_cost == null || labor_cost == null || shipping_cost == null) {
      return NextResponse.json({ error: 'Material, labor, and shipping costs are required' }, { status: 400 })
    }

    const charged = await withCreditCharge(db, userId, 1, () => generatePricingAdvice({
      platform,
      material_cost: Number(material_cost),
      labor_cost: Number(labor_cost),
      shipping_cost: Number(shipping_cost),
      competitor_price_min: competitor_price_min ? Number(competitor_price_min) : undefined,
      competitor_price_max: competitor_price_max ? Number(competitor_price_max) : undefined,
      desired_profit_margin: desired_profit_margin ? Number(desired_profit_margin) : undefined,
    }))
    if (!charged.ok) return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    const result = charged.value

    await db.from('generations').insert({ user_id: userId, tool_type: 'pricing_advice', input_data: body, output_data: result })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in generate-pricing-advice:', error)
    return NextResponse.json({ error: "We couldn't generate pricing advice. Please try again." }, { status: 500 })
  }
}
