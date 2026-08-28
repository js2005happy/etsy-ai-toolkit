import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getPaddle } from '@/lib/paddle'

export async function POST() {
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

    let customerId: string | null = null
    const { data: existing } = await service
      .from('customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing?.customer_id) {
      customerId = existing.customer_id
    } else {
      const customer = await paddle.customers.create({
        email: user.email ?? '',
        customData: { user_id: user.id },
      })
      customerId = customer.id
      await service.from('customers').upsert(
        {
          customer_id: customer.id,
          user_id: user.id,
          email: user.email ?? null,
        },
        { onConflict: 'customer_id' }
      )
    }

    const transaction = await paddle.transactions.create({
      items: [{ priceId: process.env.PADDLE_PRO_PRICE_ID!, quantity: 1 }],
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
