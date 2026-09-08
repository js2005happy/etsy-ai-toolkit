import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateReferralCode } from '@/lib/referral'

export const dynamic = 'force-dynamic'

// GET — return the caller's referral code (generating one on first use),
// their share link, and total commission earned so far.
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .maybeSingle()

    let code = profile?.referral_code
    if (!code) {
      code = generateReferralCode()
      await service.from('profiles').update({ referral_code: code }).eq('id', user.id)
    }

    const [{ data: initialCommissions }, { data: renewalCommissions }] = await Promise.all([
      service
        .from('affiliate_commissions')
        .select('amount')
        .eq('affiliate_id', user.id),
      service
        .from('affiliate_renewal_commissions')
        .select('amount')
        .eq('affiliate_id', user.id),
    ])

    const initialEarned = (initialCommissions ?? []).reduce(
      (sum, c) => sum + Number(c.amount ?? 0),
      0
    )
    const renewalEarned = (renewalCommissions ?? []).reduce(
      (sum, c) => sum + Number(c.amount ?? 0),
      0
    )
    const earned = initialEarned + renewalEarned

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://craftly.world'
    const link = `${origin}/signup?ref=${code}`

    return NextResponse.json({
      referral_code: code,
      referral_link: link,
      commission_earned: Math.round(earned * 100) / 100,
      signups: (initialCommissions ?? []).length,
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
