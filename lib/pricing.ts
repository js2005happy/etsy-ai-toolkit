/** The single product catalogue for Craftly. Do not duplicate plan values elsewhere. */
export type PlanId = 'free' | 'basic' | 'pro' | 'scale'
export type TierName = 'Free' | 'Basic' | 'Pro' | 'Scale'

export type Plan = {
  id: PlanId
  name: TierName
  monthlyPrice: number
  yearlyPrice?: number
  credits: number
  imageCredits: number
  features: string[]
  paddlePriceIdMonthly?: string
  paddlePriceIdYearly?: string
}
/** @deprecated Use Plan. Kept while presentation components migrate. */
export type Tier = {
  name: TierName
  credits: number
  images: number
  priceUsd: { month: number; year: number } | null
  priceId: { month: string; year: string } | null
}

export const PLANS: readonly Plan[] = [
  { id: 'free', name: 'Free', monthlyPrice: 0, credits: 10, imageCredits: 3, features: ['Core AI workspace', '3 image credits'] },
  { id: 'basic', name: 'Basic', monthlyPrice: 9, yearlyPrice: 79, credits: 100, imageCredits: 50, features: ['Shop workflow', 'Listing optimization'], paddlePriceIdMonthly: 'pri_01m14nefyckgxfwghxaferkem9', paddlePriceIdYearly: 'pri_01m14neg9t3h5z29sf6y5hpgma' },
  { id: 'pro', name: 'Pro', monthlyPrice: 19, yearlyPrice: 179, credits: 300, imageCredits: 120, features: ['Bulk optimization', 'Priority support'], paddlePriceIdMonthly: 'pri_01m14kdhc8ksgzbzxyan895r41', paddlePriceIdYearly: 'pri_01m14negn1c9xgym2jncv8bx14' },
  { id: 'scale', name: 'Scale', monthlyPrice: 39, yearlyPrice: 450, credits: 1000, imageCredits: 300, features: ['High-volume workflows', 'Priority support'], paddlePriceIdMonthly: 'pri_01m14neh05966mkbv7dzbf8wbw', paddlePriceIdYearly: 'pri_01m1bxtb0bv7cs53jjsnhmz6jf' },
] as const

export function getPlan(idOrName: PlanId | TierName | string | null | undefined): Plan {
  const normalized = (idOrName ?? 'free').toLowerCase()
  return PLANS.find((plan) => plan.id === normalized || plan.name.toLowerCase() === normalized) ?? PLANS[0]
}

export function tierQuota(name: TierName): { credits: number; images: number } {
  const plan = getPlan(name)
  return { credits: plan.credits, images: plan.imageCredits }
}

export function isYearlyPrice(priceId: string | undefined): boolean {
  return !!priceId && PLANS.some((plan) => plan.paddlePriceIdYearly === priceId) || priceId === 'pri_01m14nehdrx1a31rh3w74cck04'
}

export const PRICE_TO_TIER: Record<string, TierName> = Object.fromEntries(
  PLANS.flatMap((plan) => [
    ...(plan.paddlePriceIdMonthly ? [[plan.paddlePriceIdMonthly, plan.name]] : []),
    ...(plan.paddlePriceIdYearly ? [[plan.paddlePriceIdYearly, plan.name]] : []),
  ])
) as Record<string, TierName>
// Retain the retired Scale annual price only so existing subscriptions keep access.
PRICE_TO_TIER.pri_01m14nehdrx1a31rh3w74cck04 = 'Scale'

/** @deprecated Use PLANS. Compatibility adapter for existing presentation code. */
export const TIERS: Tier[] = PLANS.map((plan) => ({
  name: plan.name,
  credits: plan.credits,
  images: plan.imageCredits,
  priceUsd: plan.id === 'free' ? null : { month: plan.monthlyPrice, year: plan.yearlyPrice! },
  priceId: plan.id === 'free' ? null : { month: plan.paddlePriceIdMonthly!, year: plan.paddlePriceIdYearly! },
}))
