import { inferProductProfile, type ProductProfile } from '@/lib/product-profiles'
import type { CanonicalProduct, CommercePlatformId, ProductFactValue } from '@/lib/commerce/types'

export type ReadinessIssue = {
  field: string
  severity: 'error' | 'warning'
  message: string
}

export type ProductReadiness = {
  profile: ProductProfile
  score: number
  missingCriticalFacts: string[]
  issues: ReadinessIssue[]
}

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

function hasUsefulValue(value: ProductFactValue): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.some((item) => item.trim().length > 0)
  return true
}

function flattenFacts(product: CanonicalProduct): Array<[string, ProductFactValue]> {
  const common: Array<[string, ProductFactValue]> = [
    ['title', product.title],
    ['description', product.description],
    ['product type', product.productType],
    ['brand', product.brand],
    ['material', product.material],
    ['style', product.style],
    ['sku', product.sku],
    ['price', product.price],
    ['inventory quantity', product.inventoryQuantity],
    ['tags', product.tags],
    ['images', product.images?.length],
    ['variants', product.variants?.length],
    ['weight', product.shipping?.weightGrams],
    ['dispatch time', product.shipping?.dispatchDaysMax],
    ['digital only', product.compliance?.digitalOnly],
    ['personalized', product.compliance?.personalized],
    ['warnings', product.compliance?.warnings],
    ['certifications', product.compliance?.certifications],
  ]

  const custom = Object.entries(product.facts ?? {})
  return [...common, ...custom]
}

function factExists(product: CanonicalProduct, requiredFact: string): boolean {
  const required = normalize(requiredFact)
  return flattenFacts(product).some(([key, value]) => {
    if (!hasUsefulValue(value)) return false
    const normalizedKey = normalize(key)
    return normalizedKey.includes(required) || required.includes(normalizedKey)
  })
}

function platformSpecificIssues(product: CanonicalProduct, platform?: CommercePlatformId): ReadinessIssue[] {
  if (!platform) return []

  const issues: ReadinessIssue[] = []

  if (platform === 'google' && !product.brand) {
    issues.push({ field: 'brand', severity: 'warning', message: 'Google Shopping works best with complete brand/attribute data.' })
  }

  if ((platform === 'amazon' || platform === 'walmart') && !product.sku) {
    issues.push({ field: 'sku', severity: 'warning', message: `${platform} listings should have a stable SKU before publishing.` })
  }

  if (platform === 'ebay' && !hasUsefulValue(product.facts?.condition)) {
    issues.push({ field: 'condition', severity: 'warning', message: 'eBay buyers rely heavily on explicit condition information.' })
  }

  if (platform === 'tiktok' && (!product.images || product.images.length === 0)) {
    issues.push({ field: 'images', severity: 'error', message: 'TikTok Shop needs strong visual assets before publishing.' })
  }

  return issues
}

export function evaluateProductReadiness(product: CanonicalProduct, platform?: CommercePlatformId): ProductReadiness {
  const profile = inferProductProfile(product.title, product.productType, product.material, product.description)
  const missingCriticalFacts = profile.requiredFacts.filter((fact) => !factExists(product, fact))
  const issues: ReadinessIssue[] = missingCriticalFacts.map((fact) => ({
    field: fact,
    severity: 'error',
    message: `Missing category-critical product fact: ${fact}. Do not invent this information.`
  }))

  if (!product.description?.trim()) {
    issues.push({ field: 'description', severity: 'warning', message: 'Add a source description or rough notes before generating marketplace copy.' })
  }
  if (!product.images?.length) {
    issues.push({ field: 'images', severity: 'warning', message: 'Add at least one source product image for stronger listing and creative output.' })
  }

  issues.push(...platformSpecificIssues(product, platform))

  const criticalTotal = Math.max(profile.requiredFacts.length, 1)
  const completeness = Math.max(0, 1 - missingCriticalFacts.length / criticalTotal)
  const score = Math.round(completeness * 100)

  return { profile, score, missingCriticalFacts, issues }
}

export function buildNoFabricationContext(product: CanonicalProduct, platform?: CommercePlatformId): string {
  const readiness = evaluateProductReadiness(product, platform)
  const missing = readiness.missingCriticalFacts.length
    ? readiness.missingCriticalFacts.join(', ')
    : 'none'

  return [
    `Detected product category: ${readiness.profile.label}`,
    `Missing critical facts: ${missing}`,
    'Never invent dimensions, materials, ingredients, certifications, compatibility, safety claims, delivery promises, license rights, or other missing factual attributes.',
    'When a critical fact is missing, write around it safely or explicitly flag it for the seller instead of guessing.',
  ].join('\n')
}
