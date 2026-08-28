import { cookies } from 'next/headers'
import { defaultLocale, isLocale, type Locale } from './locales'
import { messages, type NestedDict } from './messages'

function getByPath(dict: NestedDict | undefined, key: string): unknown {
  if (!dict) return undefined
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as NestedDict)[part]
    }
    return undefined
  }, dict)
}

export function getServerLocale(): Locale {
  const lang = cookies().get('lang')?.value
  return isLocale(lang) ? lang : defaultLocale
}

export function getServerTranslations() {
  const locale = getServerLocale()

  const t = (key: string): string => {
    const translated = getByPath(messages[locale], key)
    if (typeof translated === 'string') return translated
    const fallback = getByPath(messages[defaultLocale], key)
    if (typeof fallback === 'string') return fallback
    return key
  }

  const ta = (key: string): string[] => {
    const translated = getByPath(messages[locale], key)
    if (Array.isArray(translated)) return translated as string[]
    const fallback = getByPath(messages[defaultLocale], key)
    if (Array.isArray(fallback)) return fallback as string[]
    return []
  }

  return { locale, t, ta }
}
