import { PLATFORMS as MARKETPLACES } from '@/lib/platforms'

// Product-image size presets, derived from the single source of truth in
// lib/platforms. Every marketplace maps to the closest gpt-image-supported
// canvas: square for 1:1 marketplaces, tall for portrait-first ones.
export interface ImagePlatform {
  label: string
  size: string
}

export const PLATFORMS: ImagePlatform[] = MARKETPLACES.map((p) => ({
  label: p.label,
  size: p.imageH > p.imageW ? '1024x1536' : '1024x1024',
}))

export const STYLES = [
  'Studio product photography',
  'Lifestyle scene',
  'Minimalist',
  'Vintage',
  'Bold & colorful',
]

export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Japanese',
  'Korean',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Russian',
  'Arabic',
  'Turkish',
  'Polish',
  'Vietnamese',
  'Thai',
  'No text',
]

export const VARIANT_COUNTS = [2, 3, 4]

export const CATEGORIES = [
  { value: 'jewelry', label: 'Jewelry & Accessories' },
  { value: 'clothing', label: 'Clothing & Apparel' },
  { value: 'accessories', label: 'Bags & Accessories' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'home_decor', label: 'Home & Living Decor' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'art_prints', label: 'Art Prints & Wall Decor' },
  { value: 'digital', label: 'Digital Products & Printables' },
  { value: 'craft_supplies', label: 'Craft Supplies & Tools' },
  { value: 'paper_party', label: 'Paper & Party Supplies' },
  { value: 'wedding', label: 'Weddings' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'baby', label: 'Baby & Kids' },
  { value: 'pet', label: 'Pet Supplies' },
  { value: 'beauty', label: 'Beauty & Bath' },
  { value: 'food', label: 'Food & Drink' },
  { value: 'vintage', label: 'Vintage & Antiques' },
  { value: 'handmade_crafts', label: 'Handmade Crafts & Sculpture' },
  { value: 'collectibles', label: 'Collectibles & Figurines' },
  { value: 'candles_fragrance', label: 'Candles & Fragrance' },
  { value: 'stationery', label: 'Stationery & Office' },
  { value: 'plants_garden', label: 'Plants & Garden' },
  { value: 'electronics', label: 'Electronics & Accessories' },
  { value: 'sports_outdoors', label: 'Sports & Outdoors' },
  { value: 'musical_instruments', label: 'Musical Instruments' },
  { value: 'books_media', label: 'Books, Movies & Music' },
  { value: 'photography', label: 'Photography Gear' },
  { value: 'generic', label: 'Other / General' },
]
