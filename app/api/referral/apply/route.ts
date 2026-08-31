import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

// POST — apply the ?ref= referral code (stored in a cookie by middleware) to
// the signed-in user's profile. Idempotent: only sets referred_by if empty,
// never self-attributes, and validates the code resolves to a real user.
export async function POST() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const code = cookies().get('referral_code')?.value
    if (!code) {
      return NextResponse.json({ applied: false })
    }

    const service = createServiceClient()

    const { data: referrer } = await service
      .from('profiles')
      .select('id')
      .eq('referral_code', code)
      .maybeSingle()

    if (!referrer || referrer.id === user.id) {
      return NextResponse.json({ applied: false })
    }

    const { data: profile } = await service
      .from('profiles')
      .select('referred_by')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.referred_by) {
      return NextResponse.json({ applied: false })
    }

    await service.from('profiles').update({ referred_by: code }).eq('id', user.id)
    return NextResponse.json({ applied: true })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
