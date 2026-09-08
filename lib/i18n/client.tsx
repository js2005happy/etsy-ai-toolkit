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

const recurringReferralDescription: Record<Locale, string> = {
  en: 'Earn 30% recurring commission on every successful subscription payment from people you refer.',
  de: 'Verdiene 30 % wiederkehrende Provision auf jede erfolgreiche Abonnementzahlung von Personen, die du empfiehlst.',
  fr: 'Gagnez 30 % de commission récurrente sur chaque paiement d’abonnement réussi des personnes que vous parrainez.',
  es: 'Gana un 30 % de comisión recurrente por cada pago de suscripción completado de las personas que recomiendes.',
  zh: '你推荐的用户每次成功支付订阅费用，你都可获得 30% 的持续佣金。',
  ja: '紹介したユーザーのサブスクリプション決済が成功するたびに、30%の継続報酬を獲得できます。',
  it: 'Guadagna una commissione ricorrente del 30% su ogni pagamento di abbonamento riuscito degli utenti che presenti.',
  ko: '추천한 사용자의 구독 결제가 성공할 때마다 30%의 반복 커미션을 받습니다.',
  pt: 'Ganhe 30% de comissão recorrente em cada pagamento de assinatura bem-sucedido das pessoas que você indicar.',
}

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
      if (key === 'account.referralDesc') {
        return recurringReferralDescription[locale]
      }
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
