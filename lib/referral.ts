import { randomBytes } from 'node:crypto'
import {
  PRICE_TO_TIER,
  getPlan,
  isYearlyPrice,
  type TierName,
} from '@/lib/pricing'

export const REFERRAL_RATE = 0.3

export function generateReferralCode(): string {
  return 'r_' + randomBytes(6).toString('hex')
}

/**
 * Legacy helper retained for callers that only know the user's tier.
 * This represents 30% of one monthly billing period.
 */
export function commissionForTier(tier: TierName): number {
  if (tier === 'Free') return 0
  const amount = getPlan(tier).monthlyPrice * REFERRAL_RATE
  return Math.round(amount * 100) / 100
}

/**
 * Return the recurring affiliate commission for a concrete Paddle price.
 * Monthly prices pay 30% of one month; annual prices pay 30% of the annual
 * plan price on each successful annual renewal.
 */
export function commissionForPriceId(priceId: string | undefined): number {
  if (!priceId) return 0
  const tier = PRICE_TO_TIER[priceId]
  if (!tier || tier === 'Free') return 0

  const plan = getPlan(tier)
  const billedPrice = isYearlyPrice(priceId)
    ? (plan.yearlyPrice ?? plan.monthlyPrice * 12)
    : plan.monthlyPrice

  return Math.round(billedPrice * REFERRAL_RATE * 100) / 100
}
