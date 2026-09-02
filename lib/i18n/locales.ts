export const locales = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'zh', label: '中文', short: '中' },
  { code: 'ja', label: '日本語', short: '日' },
  { code: 'it', label: 'Italiano', short: 'IT' },
  { code: 'ko', label: '한국어', short: '한' },
  { code: 'pt', label: 'Português', short: 'PT' },
] as const

export type Locale = (typeof locales)[number]['code']

export const defaultLocale: Locale = 'en'

export const localeCodes: string[] = locales.map((l) => l.code)

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && localeCodes.includes(value)
}
