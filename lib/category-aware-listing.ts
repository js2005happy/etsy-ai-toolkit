import { inferProductProfile, productProfileContext } from '@/lib/product-profiles'
import { buildNoFabricationContext, evaluateProductReadiness } from '@/lib/product-readiness'
import type { CanonicalProduct, CommercePlatformId } from '@/lib/commerce/types'
import type { ListingInput, OptimizeListingInput } from '@/lib/openai'

const COMMERCE_PLATFORMS = new Set<CommercePlatformId>([
  'etsy',
  'shopify',
  'woocommerce',
  'amazon',
  'ebay',
  'tiktok',
  'walmart',
  'google',
])

export function normalizeCommercePlatform(platform?: string): CommercePlatformId | undefined {
  if (!platform) return undefined
  return COMMERCE_PLATFORMS.has(platform as CommercePlatformId)
    ? (platform as CommercePlatformId)
    : undefined
}

export function listingInputToCanonicalProduct(input: ListingInput): CanonicalProduct {
  return {
    title: input.product_name,
    description: [input.product_type, input.material, input.style].filter(Boolean).join('. '),
    productType: input.product_type,
    material: input.material,
    style: input.style,
  }
}

export function optimizerInputToCanonicalProduct(input: OptimizeListingInput): CanonicalProduct {
  const tags = typeof input.current_tags === 'string'
    ? input.current_tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : []

  return {
    title: input.current_title || '',
    description: input.current_description || '',
    tags,
  }
}

function internalGuidance(product: CanonicalProduct, platform?: CommercePlatformId): string {
  const profile = inferProductProfile(
    product.title,
    product.productType,
    product.material,
    product.style,
    product.description,
  )

  return [
    'INTERNAL CATEGORY GUIDANCE — apply these rules but do not quote this block in the customer-facing output.',
    productProfileContext(profile, platform),
    buildNoFabricationContext(product, platform),
    'If a critical fact is missing, do not guess. Keep copy factual and use only supplied information.',
  ].join('\n')
}

export function prepareCategoryAwareListingInput(input: ListingInput): {
  input: ListingInput
  readiness: ReturnType<typeof evaluateProductReadiness>
} {
  const platform = normalizeCommercePlatform(input.platform)
  const product = listingInputToCanonicalProduct(input)
  const readiness = evaluateProductReadiness(product, platform)
  const guidance = internalGuidance(product, platform)

  return {
    input: {
      ...input,
      // generateListing already injects style into the model prompt. Adding the
      // internal block here lets us introduce category rules without changing
      // its public interface or duplicating model-calling code.
      style: `${input.style}\n\n${guidance}`,
    },
    readiness,
  }
}

export function prepareCategoryAwareOptimizerInput(input: OptimizeListingInput): {
  input: OptimizeListingInput
  readiness: ReturnType<typeof evaluateProductReadiness>
} {
  const platform = normalizeCommercePlatform(input.platform)
  const product = optimizerInputToCanonicalProduct(input)
  const readiness = evaluateProductReadiness(product, platform)
  const guidance = internalGuidance(product, platform)

  return {
    input: {
      ...input,
      current_description: [
        input.current_description || '',
        `\n\n[${guidance}]`,
      ].join('').trim(),
    },
    readiness,
  }
}

export function readinessMetadata(readiness: ReturnType<typeof evaluateProductReadiness>) {
  return {
    product_profile: {
      id: readiness.profile.id,
      label: readiness.profile.label,
    },
    readiness_score: readiness.score,
    missing_critical_facts: readiness.missingCriticalFacts,
    readiness_issues: readiness.issues,
  }
}
