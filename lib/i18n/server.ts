import { cookies } from 'next/headers'
import { defaultLocale, isLocale, type Locale } from './locales'
import { messages, type NestedDict } from './messages'

function getByPath(dict: NestedDict | undefined, key: string): unknown {
  if (!dict) return undefined
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as NestedDict)[part]
    return undefined
  }, dict)
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const lang = cookieStore.get('lang')?.value
  return isLocale(lang) ? lang : defaultLocale
}

export async function getServerTranslations() {
  const locale = await getServerLocale()
  const t = (key: string): string => {
    const translated = getByPath(messages[locale], key)
    if (typeof translated === 'string') return translated
    const fallback = getByPath(messages[defaultLocale], key)
    return typeof fallback === 'string' ? fallback : key
  }
  const ta = (key: string): string[] => {
    const translated = getByPath(messages[locale], key)
    if (Array.isArray(translated)) return translated as string[]
    const fallback = getByPath(messages[defaultLocale], key)
    return Array.isArray(fallback) ? fallback as string[] : []
  }
  return { locale, t, ta }
}
