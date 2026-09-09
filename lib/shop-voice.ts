export type ShopVoiceProfile = {
  toneTraits: string
  audience: string
  preferredVocabulary: string
  wordsToAvoid: string
  productConventions: string
  formattingPreferences: string
  brandStory: string
  sampleCopy: string
}

export const EMPTY_SHOP_VOICE: ShopVoiceProfile = {
  toneTraits: '',
  audience: '',
  preferredVocabulary: '',
  wordsToAvoid: '',
  productConventions: '',
  formattingPreferences: '',
  brandStory: '',
  sampleCopy: '',
}

const PROFILE_HEADER = 'Craftly Shop Voice Profile'
const SECTION_LABELS = [
  'Tone traits',
  'Audience',
  'Words to avoid',
  'Product conventions',
  'Formatting preferences',
  'Brand story',
  'Reference sample',
]

function readSection(source: string, label: string): string {
  const start = source.indexOf(`${label}:`)
  if (start === -1) return ''
  const contentStart = start + label.length + 1
  let end = source.length
  for (const nextLabel of SECTION_LABELS) {
    if (nextLabel === label) continue
    const candidate = source.indexOf(`\n${nextLabel}:`, contentStart)
    if (candidate !== -1 && candidate < end) end = candidate
  }
  return source.slice(contentStart, end).trim()
}

export function parseShopVoice(
  brandTone?: string | null,
  brandKeywords?: string | null
): ShopVoiceProfile {
  const profile: ShopVoiceProfile = {
    ...EMPTY_SHOP_VOICE,
    preferredVocabulary: brandKeywords?.trim() ?? '',
  }

  const tone = brandTone?.trim() ?? ''
  if (!tone) return profile

  if (!tone.startsWith(PROFILE_HEADER)) {
    profile.toneTraits = tone
    return profile
  }

  profile.toneTraits = readSection(tone, 'Tone traits')
  profile.audience = readSection(tone, 'Audience')
  profile.wordsToAvoid = readSection(tone, 'Words to avoid')
  profile.productConventions = readSection(tone, 'Product conventions')
  profile.formattingPreferences = readSection(tone, 'Formatting preferences')
  profile.brandStory = readSection(tone, 'Brand story')
  profile.sampleCopy = readSection(tone, 'Reference sample')
  return profile
}

export function serializeShopVoice(profile: ShopVoiceProfile): {
  brandTone: string | null
  brandKeywords: string | null
} {
  const guidance = [
    PROFILE_HEADER,
    `Tone traits: ${profile.toneTraits.trim()}`,
    `Audience: ${profile.audience.trim()}`,
    `Words to avoid: ${profile.wordsToAvoid.trim()}`,
    `Product conventions: ${profile.productConventions.trim()}`,
    `Formatting preferences: ${profile.formattingPreferences.trim()}`,
    `Brand story: ${profile.brandStory.trim()}`,
    `Reference sample: ${profile.sampleCopy.trim()}`,
  ].join('\n')

  const hasGuidance = Object.entries(profile)
    .filter(([key]) => key !== 'preferredVocabulary')
    .some(([, value]) => value.trim().length > 0)

  return {
    brandTone: hasGuidance ? guidance : null,
    brandKeywords: profile.preferredVocabulary.trim() || null,
  }
}

export function shopVoiceCompletion(profile: ShopVoiceProfile): number {
  const values = Object.values(profile)
  const completed = values.filter((value) => value.trim().length > 0).length
  return Math.round((completed / values.length) * 100)
}
