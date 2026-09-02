import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { consumeCredits } from '@/lib/quota'
import { calculateGlobalPricing, MARKETS } from '@/lib/global-pricing'
import { generateGlobalPricingStrategy } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { db, userId, credits } = auth

    const body = await request.json()
    const base_price = Number(body.base_price)
    const markets: string[] = Array.isArray(body.markets) ? body.markets : []
    const product_name = typeof body.product_name === 'string' ? body.product_name : undefined

    if (!base_price || base_price <= 0) {
      return NextResponse.json({ error: 'A valid base price is required' }, { status: 400 })
    }

    const validCodes = new Set(MARKETS.map((m) => m.code))
    const selected = markets.filter((c) => validCodes.has(c))
    if (selected.length === 0) {
      return NextResponse.json({ error: 'Select at least one target market' }, { status: 400 })
    }

    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 })
    }

    const breakdown = calculateGlobalPricing(base_price, selected)

    let strategy = ''
    try {
      const advice = await generateGlobalPricingStrategy({
        product_name,
        base_price_usd: base_price,
        markets: selected,
      })
      strategy = advice.strategy || ''
    } catch (e) {
      strategy = ''
    }

    await consumeCredits(db, userId, 1)

    await db.from('generations').insert({
      user_id: userId,
      tool_type: 'global_pricing',
      input_data: { base_price, markets: selected, product_name },
      output_data: { markets: breakdown, strategy },
    })

    return NextResponse.json({ markets: breakdown, strategy })
  } catch (error: any) {
    console.error('Error in global-pricing:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
