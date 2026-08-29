import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getPaddle } from '@/lib/paddle'

export async function POST() {
  try {
    const supabase = createClient()
    const service = createServiceClient()
    const paddle = getPaddle()

    // Authenticate first — never trust a customer ID supplied by the client.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await service
      .from('profiles')
      .select('paddle_customer_id, paddle_subscription_id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.paddle_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 400 }
      )
    }

    const subscriptionIds = profile.paddle_subscription_id
      ? [profile.paddle_subscription_id]
      : []

    const session = await paddle.customerPortalSessions.create(
      profile.paddle_customer_id,
      subscriptionIds
    )

    return NextResponse.json({ url: session.urls.general.overview })
  } catch (error: any) {
    console.error('Paddle Portal Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
