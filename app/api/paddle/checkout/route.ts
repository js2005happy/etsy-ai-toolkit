import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getPaddle } from '@/lib/paddle'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const service = createServiceClient()
    const paddle = getPaddle()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await request.json().catch(() => ({}))

    let customerId: string | null = null
    const { data: profile } = await service
      .from('profiles')
      .select('paddle_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.paddle_customer_id) {
      customerId = profile.paddle_customer_id
    } else {
      const customer = await paddle.customers.create({
        email: user.email ?? '',
        customData: { user_id: user.id },
      })
      customerId = customer.id
      await service
        .from('profiles')
        .update({ paddle_customer_id: customer.id })
        .eq('id', user.id)
    }

    const transaction = await paddle.transactions.create({
      items: [{ priceId: priceId || process.env.PADDLE_PRO_PRICE_ID!, quantity: 1 }],
      customerId,
      customData: { user_id: user.id },
    })

    const checkoutUrl = transaction.checkout?.url
    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Checkout is not available. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (error: any) {
    console.error('Paddle Checkout Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
