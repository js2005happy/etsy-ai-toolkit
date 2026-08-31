// Single source of truth for every marketplace the toolkit serves.
// Each platform carries its own SEO rules (title length, bullet format,
// keyword style, tone) and its standard product-image dimensions — so the
// same tool can be "tuned" per marketplace instead of hardcoding Etsy.

export interface Platform {
  id: string
  label: string
  short: string
  // SEO / copywriting rules
  titleRule: string
  titleMax: number
  descriptionRule: string
  bulletsRule: string
  keywordRule: string
  tone: string
  // standard product-image size for the marketplace
  imageSize: string
  imageW: number
  imageH: number
}

export const PLATFORMS: Platform[] = [
  {
    id: 'etsy',
    label: 'Etsy',
    short: 'Etsy',
    titleRule: 'Front-load the strongest long-tail keywords. Title max 140 characters, no ALL-CAPS or repetitive words. Emphasize craft, material, and giftability.',
    titleMax: 140,
    descriptionRule: 'Story-driven description that leads with material, craftsmanship, and how it feels to own. Weave in long-tail keywords naturally. Use short paragraphs and line breaks.',
    bulletsRule: 'Etsy does not use bullets the way Amazon does. Instead, a short "Highlights" list of 3-5 benefit lines (material, size, personalization, gift).',
    keywordRule: '13 tags, each max 20 characters, lowercase, no duplicates, multi-word phrases buyers actually search.',
    tone: 'Warm, personal, craft-forward. Sound like a maker, not a corporation.',
    imageSize: '2700x2025',
    imageW: 2700,
    imageH: 2025,
  },
  {
    id: 'amazon',
    label: 'Amazon',
    short: 'Amazon',
    titleRule: 'Title up to ~200 characters (category-dependent). Lead with brand + key feature + size/color/material. No promotional words like "best" or "free shipping". Rufus-friendly: answer the buyer\'s question directly in the first 60 characters.',
    titleMax: 200,
    descriptionRule: 'Detailed, benefit-led product description with clear sections. Scannable, no fluff, compliant with Amazon guidelines (no claims about competitor comparisons or off-site promotions).',
    bulletsRule: 'Exactly 5 bullet points, each up to ~200 characters, each led with a benefit in CAPS. Answer objections: size, material, use case, warranty, what\'s in the box.',
    keywordRule: 'Backend search terms up to 250 bytes. No commas, no duplicate words, no competitor brand names, lowercase.',
    tone: 'Confident, benefit-driven, scannable. Every sentence must justify the purchase.',
    imageSize: '2000x2000',
    imageW: 2000,
    imageH: 2000,
  },
  {
    id: 'shopify',
    label: 'Shopify',
    short: 'Shopify',
    titleRule: 'SEO title tag up to 60 characters. Brand-forward, natural, include primary keyword near the front.',
    titleMax: 60,
    descriptionRule: 'Brand-story product description. Room to be expressive — tell the story, paint the lifestyle, then list specs. Meta description up to 155 characters.',
    bulletsRule: 'Feature/benefit list under a clean heading structure (H2 sections). Conversational, on-brand, no keyword stuffing.',
    keywordRule: 'Target one primary keyword + 2-4 secondary keywords per product page. Optimize for Google organic, not marketplace search.',
    tone: 'On-brand and storytelling. Sell the feeling and the lifestyle, not just the object.',
    imageSize: '2048x2048',
    imageW: 2048,
    imageH: 2048,
  },
  {
    id: 'ebay',
    label: 'eBay',
    short: 'eBay',
    titleRule: 'Title max 80 characters. Pack in searchable attributes: brand, size, color, condition, model. No emojis, no punctuation spam.',
    titleMax: 80,
    descriptionRule: 'Clear, concise description focused on condition, exact specs, and what the buyer receives. Honest and specific about condition/imperfections.',
    bulletsRule: 'Item specifics + a short bullet list of key facts (condition, brand, measurements, included accessories).',
    keywordRule: 'Keyword-dense title and item specifics. eBay matches title words to search queries directly.',
    tone: 'Straightforward, factual, trustworthy. Details over story.',
    imageSize: '1600x1600',
    imageW: 1600,
    imageH: 1600,
  },
  {
    id: 'tiktok',
    label: 'TikTok Shop',
    short: 'TikTok',
    titleRule: 'Short, punchy, scroll-stopping title. Lead with the hook/benefit. Optimized for mobile discovery and localized language.',
    titleMax: 120,
    descriptionRule: 'Native, energetic, emoji-friendly description that matches TikTok\'s young audience. Short sentences, urgency, clear value.',
    bulletsRule: '3 quick selling points, each one short and benefit-led, written like a caption not a spec sheet.',
    keywordRule: 'Natural, conversational keywords + trending hashtags. Match how buyers type in TikTok search.',
    tone: 'Playful, energetic, native to TikTok. Emojis welcome. Sell the vibe.',
    imageSize: '1080x1440',
    imageW: 1080,
    imageH: 1440,
  },
  {
    id: 'temu',
    label: 'Temu',
    short: 'Temu',
    titleRule: 'Concise title with core keyword + spec. Price/value positioning. No fluff.',
    titleMax: 100,
    descriptionRule: 'Short, value-first description. Highlight what you get and the price advantage. Simple, direct.',
    bulletsRule: 'Compact feature list, each line one clear spec or benefit.',
    keywordRule: 'High-volume generic keywords. Temu is price-driven; keywords lean generic and category-level.',
    tone: 'Value-driven, direct, price-conscious. Emphasize deal and quantity.',
    imageSize: '1024x1024',
    imageW: 1024,
    imageH: 1024,
  },
  {
    id: 'walmart',
    label: 'Walmart',
    short: 'Walmart',
    titleRule: 'Title 50-75 characters. Brand + key feature + size/color. Front-load searchable attributes, no promo words.',
    titleMax: 75,
    descriptionRule: 'Clear, benefit-led description. Walmart favors concise, keyword-rich copy with accurate specs.',
    bulletsRule: '3-5 short bullets, each a single clear benefit or spec. No marketing fluff.',
    keywordRule: 'Front-load core keywords. Walmart search is more literal — match exact attribute terms.',
    tone: 'Clear, trustworthy, value-focused. Similar to Amazon but slightly shorter.',
    imageSize: '2000x2000',
    imageW: 2000,
    imageH: 2000,
  },
  {
    id: 'google',
    label: 'Google Shopping',
    short: 'Google',
    titleRule: 'Title up to 150 characters. Clear, searchable attributes (brand, type, size, color). No promotional language — Google rejects "best", "cheap", "free".',
    titleMax: 150,
    descriptionRule: 'Factual, structured product description matching the exact attributes a shopper would search. Optimize for Google product schema.',
    bulletsRule: 'Attribute/value pairs that map to Google\'s product data spec (material, color, size, GTIN).',
    keywordRule: 'Literal, attribute-driven keywords. Google Shopping matches exact product attributes.',
    tone: 'Factual, structured, SEO-precise. No hype, no emojis.',
    imageSize: '1200x1200',
    imageW: 1200,
    imageH: 1200,
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    short: 'Pinterest',
    titleRule: 'Discoverable pin title, 40-100 characters, keyword-rich and inspiring (not salesy).',
    titleMax: 100,
    descriptionRule: 'Pin description with natural keywords + a soft CTA. Pinterest is a discovery engine — write for search and inspiration.',
    bulletsRule: 'N/A for Pinterest — a caption with keywords and a gentle call-to-action instead.',
    keywordRule: 'Long-tail inspirational keywords. Pinterest users search for ideas, not products.',
    tone: 'Inspirational, aspirational, visual-first. Sell the lifestyle and the idea.',
    imageSize: '1000x1500',
    imageW: 1000,
    imageH: 1500,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    short: 'Instagram',
    titleRule: 'Short, catchy caption hook. First line must stop the scroll.',
    titleMax: 2200,
    descriptionRule: 'Caption that tells a story or shows the product in life. Emojis, line breaks, and a CTA. Hashtags matter.',
    bulletsRule: 'N/A for Instagram — caption + hashtags instead.',
    keywordRule: 'Mix of broad and niche hashtags (8-15). Instagram search runs on hashtags and location.',
    tone: 'Visual, social, on-brand. Speak to a scrolling human, not a search engine.',
    imageSize: '1080x1350',
    imageW: 1080,
    imageH: 1350,
  },
]

export function getPlatform(id?: string | null): Platform {
  return PLATFORMS.find((p) => p.id === id) || PLATFORMS[0]
}

export function getPlatformLabel(id?: string | null): string {
  return getPlatform(id).label
}

export const PLATFORM_IDS = PLATFORMS.map((p) => p.id)
