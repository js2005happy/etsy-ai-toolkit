export type TierName = 'Free' | 'Basic' | 'Pro' | 'Scale'

export interface Tier {
  name: TierName
  credits: number
  images: number
  priceId: {
    month: string
    year: string
  } | null
}

// The monthly credit / image quotas per tier. `priceId` reuses the existing
// Paddle catalog prices (Starter/Pro/Advanced) whose amounts already match
// $9 / $19 / $39. Free has no priceId — it's the lead-gen entry point.
export const TIERS: Tier[] = [
  {
    name: 'Free',
    credits: 10,
    images: 0,
    priceId: null,
  },
  {
    name: 'Basic',
    credits: 100,
    images: 0,
    priceId: {
      month: 'pri_01m14nefyckgxfwghxaferkem9', // $9 Starter Monthly
      year: 'pri_01m14neg9t3h5z29sf6y5hpgma', // $79 Starter Yearly
    },
  },
  {
    name: 'Pro',
    credits: 300,
    images: 30,
    priceId: {
      month: 'pri_01m14kdhc8ksgzbzxyan895r41', // $19 Pro Monthly
      year: 'pri_01m14negn1c9xgym2jncv8bx14', // $179 Pro Yearly
    },
  },
  {
    name: 'Scale',
    credits: 1000,
    images: 100,
    priceId: {
      month: 'pri_01m14neh05966mkbv7dzbf8wbw', // $39 Advanced Monthly
      year: 'pri_01m14nehdrx1a31rh3w74cck04', // $349 Advanced Yearly
    },
  },
]

// price_id → tier, used by the webhook to map a Paddle subscription back to
// the access tier it should grant.
export const PRICE_TO_TIER: Record<string, TierName> = {
  pri_01m14nefyckgxfwghxaferkem9: 'Basic', // $9 monthly
  pri_01m14neg9t3h5z29sf6y5hpgma: 'Basic', // $79 yearly
  pri_01m14kdhc8ksgzbzxyan895r41: 'Pro', // $19 monthly
  pri_01m14negn1c9xgym2jncv8bx14: 'Pro', // $179 yearly
  pri_01m14neh05966mkbv7dzbf8wbw: 'Scale', // $39 monthly
  pri_01m14nehdrx1a31rh3w74cck04: 'Scale', // $349 yearly
}

export function tierQuota(name: TierName): { credits: number; images: number } {
  const tier = TIERS.find((t) => t.name === name)
  return { credits: tier?.credits ?? 0, images: tier?.images ?? 0 }
}
