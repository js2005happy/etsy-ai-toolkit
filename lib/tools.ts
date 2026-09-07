export type AiTool = { id: string; name: string; category: 'listing' | 'messages' | 'marketing' | 'other'; href: string }

/** Canonical registry for navigation, product copy, and SEO. */
export const AI_TOOLS: readonly AiTool[] = [
  { id: 'listing', name: 'Listing Generator', category: 'listing', href: '/dashboard/listing' },
  { id: 'optimizer', name: 'Listing Optimizer', category: 'listing', href: '/dashboard/optimizer' },
  { id: 'keywords', name: 'Keyword Generator', category: 'listing', href: '/dashboard/keywords' },
  { id: 'bullets', name: 'Bullet Generator', category: 'listing', href: '/dashboard/bullets' },
  { id: 'messages', name: 'Buyer Messages', category: 'messages', href: '/dashboard/messages' },
  { id: 'reviews', name: 'Review Replies', category: 'messages', href: '/dashboard/reviews' },
  { id: 'email', name: 'Email Writer', category: 'messages', href: '/dashboard/email' },
  { id: 'announcement', name: 'Shop Announcement', category: 'messages', href: '/dashboard/announcement' },
  { id: 'social', name: 'Social Posts', category: 'marketing', href: '/dashboard/social' },
  { id: 'ad-copy', name: 'Ad Copy', category: 'marketing', href: '/dashboard/ad-copy' },
  { id: 'pricing', name: 'Pricing Advisor', category: 'marketing', href: '/dashboard/pricing' },
  { id: 'global-pricing', name: 'Global Pricing', category: 'marketing', href: '/dashboard/global-pricing' },
  { id: 'images', name: 'Product Images', category: 'other', href: '/dashboard/images' },
  { id: 'translate', name: 'Translation', category: 'other', href: '/dashboard/translate' },
  { id: 'brand-story', name: 'Brand Story', category: 'other', href: '/dashboard/brand-story' },
  { id: 'competitor-analysis', name: 'Competitor Analysis', category: 'other', href: '/dashboard/competitor-analysis' },
]

export const AI_TOOL_COUNT = AI_TOOLS.length
