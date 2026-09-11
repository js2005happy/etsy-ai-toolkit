import OpenAI from 'openai'
import { getPlatform } from '@/lib/platforms'
import { getProductProfile, inferProductProfile, productProfileContext, type ProductCategory } from '@/lib/product-profiles'
import { evaluateProductReadiness, buildNoFabricationContext } from '@/lib/product-readiness'
import type { CanonicalProduct, CommercePlatformId, ProductFactValue } from '@/lib/commerce/types'

const PRIMARY_CHAT_MODEL = 'gpt-4o-mini'
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile'

export type CategoryAwareListingInput = {
  product_name: string
  product_type: string
  category?: ProductCategory
  material?: string
  style?: string
  brand?: string
  sku?: string
  price?: number
  currency?: string
  inventory_quantity?: number
  platform?: CommercePlatformId | string
  brand_tone?: string
  brand_keywords?: string
  facts?: Record<string, ProductFactValue>
}

export type CategoryAwareOptimizeInput = {
  current_title?: string
  current_description?: string
  current_tags?: string
  product_type?: string
  category?: ProductCategory
  material?: string
  style?: string
  brand?: string
  sku?: string
  price?: number
  currency?: string
  inventory_quantity?: number
  platform?: CommercePlatformId | string
  brand_tone?: string
  brand_keywords?: string
  facts?: Record<string, ProductFactValue>
}

export type CategoryAwareResult = {
  title: string
  description: string
  tags: string[]
  suggestions?: string
  product_profile: string
  readiness_score: number
  missing_critical_facts: string[]
  readiness_issues: Array<{ field: string; severity: 'error' | 'warning'; message: string }>
}

function primaryClient() { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL }) }
function groqClient() { return new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: GROQ_BASE_URL }) }

function extractJson(content: string): any {
  const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1))
  return JSON.parse(cleaned)
}

async function chatJson(system: string, user: string): Promise<any> {
  const messages: any[] = [{ role: 'system', content: system }, { role: 'user', content: user }]
  const call = (client: OpenAI, model: string) => client.chat.completions.create({ model, messages, response_format: { type: 'json_object' }, temperature: 0.35 })
  try {
    const r = await call(primaryClient(), PRIMARY_CHAT_MODEL)
    return extractJson(r.choices[0]?.message?.content || '{}')
  } catch (primaryErr) {
    if (!process.env.GROQ_API_KEY) throw primaryErr
    const r = await call(groqClient(), GROQ_CHAT_MODEL)
    return extractJson(r.choices[0]?.message?.content || '{}')
  }
}

function cleanList(items: unknown, max: number, maxLen = 0): string[] {
  const values = Array.isArray(items) ? items : []
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    let s = String(value ?? '').trim().replace(/^#+/, '')
    if (!s) continue
    if (maxLen) s = s.slice(0, maxLen)
    const key = s.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key); out.push(s)
    if (out.length >= max) break
  }
  return out
}

function toCanonicalProduct(input: CategoryAwareListingInput): CanonicalProduct {
  return {
    title: input.product_name, category: input.category, productType: input.product_type, brand: input.brand, material: input.material, style: input.style,
    sku: input.sku, price: input.price, currency: input.currency, inventoryQuantity: input.inventory_quantity, facts: input.facts,
  }
}

function optimizeCanonicalProduct(input: CategoryAwareOptimizeInput): CanonicalProduct {
  return {
    title: input.current_title || input.product_type || 'Product', description: input.current_description, category: input.category, productType: input.product_type,
    brand: input.brand, material: input.material, style: input.style, sku: input.sku, price: input.price, currency: input.currency,
    inventoryQuantity: input.inventory_quantity, tags: input.current_tags?.split(',').map((v) => v.trim()).filter(Boolean), facts: input.facts,
  }
}

function platformContext(id?: string) {
  const p = getPlatform(id)
  return [`Marketplace: ${p.label}`, `Title rule: ${p.titleRule}`, `Description rule: ${p.descriptionRule}`, `Bullets/highlights rule: ${p.bulletsRule}`, `Keyword rule: ${p.keywordRule}`, `Tone: ${p.tone}`].join('\n')
}

function factsText(facts?: Record<string, ProductFactValue>): string {
  if (!facts || !Object.keys(facts).length) return 'No additional structured facts were supplied.'
  return Object.entries(facts).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : String(value ?? '')}`).join('\n')
}

function metadata(product: CanonicalProduct, platform?: CommercePlatformId | string) {
  const readiness = evaluateProductReadiness(product, platform as CommercePlatformId | undefined)
  return { product_profile: readiness.profile.label, readiness_score: readiness.score, missing_critical_facts: readiness.missingCriticalFacts, readiness_issues: readiness.issues }
}

function profileFor(input: { category?: ProductCategory }, ...parts: Array<string | null | undefined>) {
  return getProductProfile(input.category) ?? inferProductProfile(...parts)
}

export async function generateCategoryAwareListing(input: CategoryAwareListingInput): Promise<CategoryAwareResult> {
  const product = toCanonicalProduct(input)
  const platform = getPlatform(input.platform)
  const profile = profileFor(input, input.product_name, input.product_type, input.material, input.style)
  const tagCount = platform.id === 'etsy' ? 13 : (platform.id === 'shopify' || platform.id === 'woocommerce') ? 5 : 15
  const noFabrication = buildNoFabricationContext(product, platform.id as CommercePlatformId)
  const brandVoice = [input.brand_tone && `Brand tone: ${input.brand_tone}`, input.brand_keywords && `Brand keywords: ${input.brand_keywords}`].filter(Boolean).join('\n')
  const commerceFacts = [input.brand && `Brand: ${input.brand}`, input.sku && `SKU: ${input.sku}`, input.price != null && `Price: ${input.currency || 'USD'} ${input.price}`, input.inventory_quantity != null && `Inventory: ${input.inventory_quantity}`].filter(Boolean).join('\n')

  const raw = await chatJson(
    `You are a category-aware e-commerce listing specialist for ${platform.label}. Return valid JSON only.`,
    [
      'Create a high-converting listing using ONLY the product facts supplied by the seller.', '', 'MARKETPLACE RULES', platformContext(platform.id), '',
      'CATEGORY RULES', productProfileContext(profile, platform.id), '', 'FACT SAFETY', noFabrication, '', 'SELLER INPUT',
      `Product name: ${input.product_name}`, `Product type: ${input.product_type}`, `Material: ${input.material || 'not provided'}`, `Style: ${input.style || 'not provided'}`,
      commerceFacts, factsText(input.facts), brandVoice, '',
      'Do not invent missing dimensions, ingredients, compatibility, certifications, delivery promises, license rights, materials, care instructions or safety claims.',
      'If a missing fact would normally be important, omit the unsupported claim from buyer-facing copy.',
      `Return JSON with title, description, tags. Title maximum: ${platform.titleMax} characters. Tags: at most ${tagCount}.`,
    ].filter(Boolean).join('\n')
  )

  return { title: String(raw.title || input.product_name).trim().slice(0, platform.titleMax), description: String(raw.description || '').trim(), tags: cleanList(raw.tags, tagCount, platform.id === 'etsy' ? 20 : 60), ...metadata(product, platform.id) }
}

export async function optimizeCategoryAwareListing(input: CategoryAwareOptimizeInput): Promise<CategoryAwareResult> {
  const product = optimizeCanonicalProduct(input)
  const platform = getPlatform(input.platform)
  const profile = profileFor(input, input.current_title, input.current_description, input.product_type, input.material, input.style)
  const tagCount = platform.id === 'etsy' ? 13 : (platform.id === 'shopify' || platform.id === 'woocommerce') ? 5 : 15
  const noFabrication = buildNoFabricationContext(product, platform.id as CommercePlatformId)
  const brandVoice = [input.brand_tone && `Brand tone: ${input.brand_tone}`, input.brand_keywords && `Brand keywords: ${input.brand_keywords}`].filter(Boolean).join('\n')

  const raw = await chatJson(
    `You are a category-aware e-commerce listing optimizer for ${platform.label}. Return valid JSON only.`,
    [
      'Improve the listing without inventing product facts.', '', 'MARKETPLACE RULES', platformContext(platform.id), '', 'CATEGORY RULES', productProfileContext(profile, platform.id), '',
      'FACT SAFETY', noFabrication, '', 'CURRENT LISTING', `Title: ${input.current_title || 'not provided'}`, `Description: ${input.current_description || 'not provided'}`,
      `Tags: ${input.current_tags || 'not provided'}`, `Product type: ${input.product_type || 'not provided'}`, `Material: ${input.material || 'not provided'}`, factsText(input.facts), brandVoice, '',
      'Return JSON with title, description, tags, suggestions.', 'Suggestions must tell the seller which missing facts would most improve buyer confidence or compliance.',
    ].filter(Boolean).join('\n')
  )

  return { title: String(raw.title || input.current_title || 'Product').trim().slice(0, platform.titleMax), description: String(raw.description || input.current_description || '').trim(), tags: cleanList(raw.tags, tagCount, platform.id === 'etsy' ? 20 : 60), suggestions: String(raw.suggestions || '').trim(), ...metadata(product, platform.id) }
}
