import { randomBytes } from 'node:crypto'
import type { TierName } from '@/lib/pricing'

export const REFERRAL_RATE = 0.3

export function generateReferralCode(): string {
  return 'r_' + randomBytes(6).toString('hex')
}

// 30% of the *monthly* price of the plan the referred user bought — matches
// the "paid on their first month" promise in the affiliate copy.
const MONTHLY_PRICE: Record<Exclude<TierName, 'Free'>, number> = {
  Basic: 9,
  Pro: 19,
  Scale: 39,
}

export function commissionForTier(tier: TierName): number {
  if (tier === 'Free') return 0
  return Math.round(MONTHLY_PRICE[tier] * REFERRAL_RATE * 100) / 100
}
