export type TierName = 'Starter' | 'Pro' | 'Advanced'

export interface Tier {
  name: TierName
  description: string
  features: string[]
  priceId: {
    month: string
    year: string
  }
}

// Edit your plans here. Each `priceId` points to a Paddle price (one monthly,
// one yearly). Reorder, rename, or add features without touching the page.
export const TIERS: Tier[] = [
  {
    name: 'Starter',
    description: 'For new shops getting started.',
    features: [
      '50 AI credits per month',
      'Listing generator',
      'Message & review replies',
      'Social media posts',
      'Keyword research',
    ],
    priceId: {
      month: 'pri_01m14nefyckgxfwghxaferkem9',
      year: 'pri_01m14neg9t3h5z29sf6y5hpgma',
    },
  },
  {
    name: 'Pro',
    description: 'For growing shops that need more output.',
    features: [
      'Unlimited AI credits',
      'Everything in Starter',
      'Priority AI processing',
      'Advanced SEO templates',
      'Listing translation & optimizer',
    ],
    priceId: {
      month: 'pri_01m14kdhc8ksgzbzxyan895r41',
      year: 'pri_01m14negn1c9xgym2jncv8bx14',
    },
  },
  {
    name: 'Advanced',
    description: 'For established shops and power sellers.',
    features: [
      'Everything in Pro',
      'Multiple shop support',
      'Bulk generation (50+ listings)',
      'Dedicated support',
      'API access',
    ],
    priceId: {
      month: 'pri_01m14neh05966mkbv7dzbf8wbw',
      year: 'pri_01m14nehdrx1a31rh3w74cck04',
    },
  },
]
