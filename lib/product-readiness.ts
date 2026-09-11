import { getProductProfile, inferProductProfile, type ProductProfile } from '@/lib/product-profiles'
import type { CanonicalProduct, CommercePlatformId, ProductFactValue } from '@/lib/commerce/types'

export type ReadinessIssue = { field: string; severity: 'error' | 'warning'; message: string }
export type ProductReadiness = { profile: ProductProfile; score: number; missingCriticalFacts: string[]; issues: ReadinessIssue[] }

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const FACT_ALIASES: Record<string, string[]> = {
  'fabric material': ['fabric', 'material'],
  'color variant': ['color', 'colour', 'variant', 'variants'],
  'production dispatch time': ['production time', 'dispatch time', 'processing time', 'lead time'],
  'metal material': ['metal', 'material'],
  'closure size': ['closure', 'size', 'length'],
  'dimensions aspect ratio': ['dimensions', 'dimension', 'aspect ratio', 'size'],
  'paper canvas file format': ['paper', 'canvas', 'file format', 'format'],
  'character length limits': ['character limit', 'length limit', 'characters'],
  'proof revision process': ['proof', 'revision', 'proof process', 'revision process'],
  'final sale policy if applicable': ['final sale', 'return policy', 'refund policy'],
  'digital only disclosure': ['digital only', 'digital-only', 'no physical item'],
  'dimensions pages': ['dimensions', 'pages', 'page count', 'size'],
  'license use rights': ['license', 'licence', 'use rights', 'commercial use'],
  'skin hair type': ['skin type', 'hair type'],
  'dietary certifications only if verified': ['dietary certifications', 'certifications'],
  'connectors specs': ['connector', 'connectors', 'specs', 'specifications'],
  'power rating if relevant': ['power rating', 'power', 'wattage', 'voltage'],
  'warranty returns': ['warranty', 'returns', 'return policy'],
  'capacity fit': ['capacity', 'fit'],
  'compatibility use': ['compatibility', 'use'],
  'care use': ['care', 'use', 'instructions'],
  'what is included': ['what is included', 'included', 'box contents', 'contents'],
  'fulfillment expectations': ['fulfillment', 'dispatch time', 'processing time', 'delivery method'],
}

function hasUsefulValue(value: ProductFactValue): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.some((item) => item.trim().length > 0)
  return true
}

function flattenFacts(product: CanonicalProduct): Array<[string, ProductFactValue]> {
  const common: Array<[string, ProductFactValue]> = [
    ['title', product.title], ['description', product.description], ['product type', product.productType], ['brand', product.brand],
    ['material', product.material], ['style', product.style], ['sku', product.sku], ['price', product.price],
    ['inventory quantity', product.inventoryQuantity], ['tags', product.tags], ['images', product.images?.length], ['variants', product.variants?.length],
    ['weight', product.shipping?.weightGrams], ['dispatch time', product.shipping?.dispatchDaysMax], ['digital only', product.compliance?.digitalOnly],
    ['personalized', product.compliance?.personalized], ['warnings', product.compliance?.warnings], ['certifications', product.compliance?.certifications],
  ]
  return [...common, ...Object.entries(product.facts ?? {})]
}

function requiredCandidates(requiredFact: string): string[] {
  const normalized = normalize(requiredFact)
  const aliases = FACT_ALIASES[normalized] ?? []
  const slashParts = requiredFact.split('/').map(normalize).filter(Boolean)
  return Array.from(new Set([normalized, ...aliases.map(normalize), ...slashParts]))
}

function factExists(product: CanonicalProduct, requiredFact: string): boolean {
  const candidates = requiredCandidates(requiredFact)
  return flattenFacts(product).some(([key, value]) => {
    if (!hasUsefulValue(value)) return false
    const normalizedKey = normalize(key)
    return candidates.some((candidate) => normalizedKey === candidate || normalizedKey.includes(candidate) || candidate.includes(normalizedKey))
  })
}

function platformSpecificIssues(product: CanonicalProduct, platform?: CommercePlatformId): ReadinessIssue[] {
  if (!platform) return []
  const issues: ReadinessIssue[] = []
  if (platform === 'google' && !product.brand) issues.push({ field: 'brand', severity: 'warning', message: 'Google Shopping works best with complete brand/attribute data.' })
  if ((platform === 'amazon' || platform === 'walmart') && !product.sku) issues.push({ field: 'sku', severity: 'warning', message: `${platform} listings should have a stable SKU before publishing.` })
  if (platform === 'ebay' && !hasUsefulValue(product.facts?.condition)) issues.push({ field: 'condition', severity: 'warning', message: 'eBay buyers rely heavily on explicit condition information.' })
  if (platform === 'tiktok' && (!product.images || product.images.length === 0)) issues.push({ field: 'images', severity: 'error', message: 'TikTok Shop needs strong visual assets before publishing.' })
  if ((platform === 'shopify' || platform === 'woocommerce') && !product.price) issues.push({ field: 'price', severity: 'warning', message: `${platform} product drafts should have a verified selling price before publishing.` })
  return issues
}

export function evaluateProductReadiness(product: CanonicalProduct, platform?: CommercePlatformId): ProductReadiness {
  const profile = getProductProfile(product.category) ?? inferProductProfile(product.title, product.productType, product.material, product.description)
  const missingCriticalFacts = profile.requiredFacts.filter((fact) => !factExists(product, fact))
  const issues: ReadinessIssue[] = missingCriticalFacts.map((fact) => ({ field: fact, severity: 'error', message: `Missing category-critical product fact: ${fact}. Do not invent this information.` }))
  if (!product.description?.trim()) issues.push({ field: 'description', severity: 'warning', message: 'Add a source description or rough notes before generating marketplace copy.' })
  if (!product.images?.length) issues.push({ field: 'images', severity: 'warning', message: 'Add at least one source product image for stronger listing and creative output.' })
  issues.push(...platformSpecificIssues(product, platform))
  const criticalTotal = Math.max(profile.requiredFacts.length, 1)
  const score = Math.round(Math.max(0, 1 - missingCriticalFacts.length / criticalTotal) * 100)
  return { profile, score, missingCriticalFacts, issues }
}

export function buildNoFabricationContext(product: CanonicalProduct, platform?: CommercePlatformId): string {
  const readiness = evaluateProductReadiness(product, platform)
  return [
    `Detected product category: ${readiness.profile.label}`,
    `Missing critical facts: ${readiness.missingCriticalFacts.length ? readiness.missingCriticalFacts.join(', ') : 'none'}`,
    'Never invent dimensions, materials, ingredients, certifications, compatibility, safety claims, delivery promises, license rights, or other missing factual attributes.',
    'When a critical fact is missing, write around it safely or explicitly flag it for the seller instead of guessing.',
  ].join('\n')
}
