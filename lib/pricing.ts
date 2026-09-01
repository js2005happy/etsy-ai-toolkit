export type TierName = 'Free' | 'Basic' | 'Pro' | 'Scale'

export interface Tier {
  name: TierName
  credits: number
  images: number
  // Static USD price, server-rendered so the pricing page never shows an empty
  // placeholder while Paddle.js loads (or when it fails). Paddle's localized
  // PricePreview still overrides this at runtime when available.
  priceUsd: {
    month: number
    year: number
  } | null
  priceId: {
    month: string
    year: string
  } | null
}

// The monthly credit / image quotas per tier. `priceId` reuses the existing
// Paddle catalog prices (Starter/Pro/Advanced) whose amounts already match
// $9 / $19 / $39 monthly. Free has no priceId — it's the lead-gen entry point.
//
// Image quotas are costed against the most expensive path (nano-banana-2
// image-to-image @ $0.055/image). Monthly tiers hold ~65% margin; Scale runs
// 300 images at ~58% (owner accepted this to keep the count high):
//   Basic 50  -> $2.75  / $9  = 69.4% margin
//   Pro   120 -> $6.60  / $19 = 65.3% margin
//   Scale 300 -> $16.50 / $39 = 57.7% margin
//
// Scale yearly was raised to $450 (from $349) to hold ~56% margin under the
// 12× lump quota. Basic/Pro yearly stay $79/$179 — their margin lands ~56-58%
// once the 12× quota applies. Yearly quota is granted as a 12× lump at
// purchase (see syncUserPlan).
export const TIERS: Tier[] = [
  {
    name: 'Free',
    credits: 10,
    images: 3, // lead-gen trial: 3 free posters so Free users can try image gen
    priceUsd: null,
    priceId: null,
  },
  {
    name: 'Basic',
    credits: 100,
    images: 50,
    priceUsd: { month: 9, year: 79 },
    priceId: {
      month: 'pri_01m14nefyckgxfwghxaferkem9', // $9 Starter Monthly
      year: 'pri_01m14neg9t3h5z29sf6y5hpgma', // $79 Starter Yearly
    },
  },
  {
    name: 'Pro',
    credits: 300,
    images: 120,
    priceUsd: { month: 19, year: 179 },
    priceId: {
      month: 'pri_01m14kdhc8ksgzbzxyan895r41', // $19 Pro Monthly
      year: 'pri_01m14negn1c9xgym2jncv8bx14', // $179 Pro Yearly
    },
  },
  {
    name: 'Scale',
    credits: 1000,
    images: 300,
    priceUsd: { month: 39, year: 450 },
    priceId: {
      month: 'pri_01m14neh05966mkbv7dzbf8wbw', // $39 Advanced Monthly
      year: 'pri_01m1bxtb0bv7cs53jjsnhmz6jf', // $450 Advanced Yearly
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
  pri_01m14nehdrx1a31rh3w74cck04: 'Scale', // $349 yearly (legacy, existing subs)
  pri_01m1bxtb0bv7cs53jjsnhmz6jf: 'Scale', // $450 yearly
}

export function tierQuota(name: TierName): { credits: number; images: number } {
  const tier = TIERS.find((t) => t.name === name)
  return { credits: tier?.credits ?? 0, images: tier?.images ?? 0 }
}

// Yearly price ids — used to grant the yearly quota as a 12× lump at purchase
// instead of a single month's worth (monthly subs re-grant on each renew).
const YEARLY_PRICE_IDS = new Set([
  ...TIERS.flatMap((t) => (t.priceId ? [t.priceId.year] : [])),
  'pri_01m14nehdrx1a31rh3w74cck04', // legacy $349 Advanced Yearly — still billed to existing subs
])

export function isYearlyPrice(priceId: string | undefined): boolean {
  return !!priceId && YEARLY_PRICE_IDS.has(priceId)
}
