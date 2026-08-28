'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { defaultLocale, isLocale, type Locale } from './locales'
import { messages } from './messages'

type Dict = Record<string, unknown>

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  ta: (key: string) => string[]
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getByPath(dict: Dict | undefined, key: string): unknown {
  if (!dict) return undefined
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Dict)[part]
    }
    return undefined
  }, dict)
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function asArray(value: unknown): string[] | undefined {
  return Array.isArray(value) ? (value as string[]) : undefined
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`
    // Server components read the cookie at request time, so reload to re-render them.
    window.location.reload()
  }, [])

  const t = useCallback(
    (key: string): string => {
      const translated = asString(getByPath(messages[locale], key))
      if (translated !== undefined) return translated
      const fallback = asString(getByPath(messages[defaultLocale], key))
      if (fallback !== undefined) return fallback
      return key
    },
    [locale]
  )

  const ta = useCallback(
    (key: string): string[] => {
      const translated = asArray(getByPath(messages[locale], key))
      if (translated !== undefined) return translated
      const fallback = asArray(getByPath(messages[defaultLocale], key))
      if (fallback !== undefined) return fallback
      return []
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, ta }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}
